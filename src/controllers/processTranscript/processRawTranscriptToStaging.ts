import * as fs from 'fs'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { RawTranscript, StagingTranscriptProcessingStage } from 'models'
import { ObjectId } from 'mongoose'
import { getRegLogger } from 'util/loggers'
import { GPTLog, GPTLogType, StagingLineItemType, StagingTranscript } from '../../models'

import { makeMongoURI } from 'config/envVariables'
import { ChatGPTSession, GPTPrompt } from './prompt'

const logger = getRegLogger(__filename)

export async function readPrompt(promptPath: string) {
  try {
    const rawData = await fs.promises.readFile(promptPath, 'utf-8')
    const prompt = JSON.parse(rawData)
    return prompt
  } catch (error) {
    logger.error('Error reading the file:', error)
  }
}

const binaryClassification = async (companyName, transcriptDocuments) => {
  const classifierJSON = await readPrompt('prompts/guidance_prompt.json')
  const classifierContext = classifierJSON['classifier_context']

  // Classifier for further processing
  const classifyChat = new ChatGPTSession({
    model: 'gpt-3.5-turbo',
    terminationKey: 'TERMINATE',
  })
  const furtherProcessingDocs = (
    await Promise.all(
      transcriptDocuments.map(async (doc) => {
        try {
          if (doc?.pageContent?.length < 20) {
            return null
          }
          const classifierPrompt = new GPTPrompt({
            role: 'user',
            content: classifierContext.content,
            metaData: {
              companyName,
              transcriptParagraph: doc.pageContent,
            },
            responseType: 'bool',
            temp: 0,
          })
          const classifierResult = await classifyChat.openAIGPTAPICall({
            prompt: classifierPrompt,
          })
          if (classifierResult) {
            console.info('Found financial info in doc %o', doc.metadata?.loc?.lines)
            return doc
          }
          return null
        } catch (err) {
          logger.error(`Error classifying line ${err}`)
          return null
        }
      }),
    )
  ).filter((doc) => doc != null)

  return furtherProcessingDocs
}

export default async function processRawTranscriptToStaging(
  rawTranscriptId: string,
  useBinaryClassifier: boolean = false,
): Promise<ObjectId> {
  const rawTranscript = await RawTranscript.findOne({ _id: rawTranscriptId })
  if (!rawTranscript) throw new Error(`Raw transcript ${rawTranscriptId} not found`)

  const { fiscalYear, fiscalQuarter, companyName, companyTicker } = rawTranscript

  logger.info(`Start processing raw transcript ${rawTranscriptId} to staging transcript line items`)
  const processingStartTime = new Date()

  // binaryClassification(transcript, false)

  // join the text attribute of each object in transcript array into a single string
  const transcriptText = rawTranscript['transcript'].map((item: { text: string }) => item.text).join('\n')

  const text = transcriptText
  const splitter = new CharacterTextSplitter({
    separator: '\n',
    chunkSize: 1000,
    chunkOverlap: 300,
  })
  let transcriptDocuments = await splitter.createDocuments([text])

  if (useBinaryClassifier) {
    transcriptDocuments = await binaryClassification(companyName, transcriptDocuments)
  }

  // read prompts/oneshot_prompt.json and store in variable
  const extractionJSON = await readPrompt('prompts/extraction_prompt.json')
  const extractJSON = extractionJSON['extract_line_items']

  // create a new LLMChain object
  const extractChat = new ChatGPTSession({
    model: 'gpt-4-1106-preview',
    terminationKey: 'TERMINATE',
  })

  // loop through transcript documents and generate guidance for each

  const stagingTranscript = await StagingTranscript.create({
    companyName,
    companyTicker,
    fiscalQuarter,
    fiscalYear,
    rawTranscriptId,
    sessionId: extractChat.sessionId,
    stagingLineItems: [],
  })
  const stagingTranscriptId = stagingTranscript._id

  const stagingLineItems: StagingLineItemType[] = []
  const gptLog: GPTLogType = {
    companyTicker,
    fiscalYear,
    fiscalQuarter,
    gptModel: extractChat.defaultModel,
    rawTranscriptId,
    durationMetrics: {},
    lineItems: [],
  }

  // we can probably also async this with a limit with - https://caolan.github.io/async/v3/docs.html#parallel
  // or - https://dev.to/woovi/processing-promises-in-batch-2le6
  for (const doc of transcriptDocuments) {
    try {
      const extractPrompt = new GPTPrompt({
        role: 'user',
        content: extractJSON['content'],
        metaData: {
          companyName: rawTranscript.companyName,
          thisQuarter: 'Q' + rawTranscript.fiscalQuarter,
          thisYear: rawTranscript.fiscalYear,
          nextQuarter: 'Q' + (rawTranscript.fiscalQuarter + 1),
          nextYear: rawTranscript.fiscalYear + 1,
          excerpt: doc['pageContent'],
        },
        responseType: extractJSON['response_type'],
        temp: 0,
      })
      const [rawResult, response] = await extractChat.openAIGPTAPICall({ prompt: extractPrompt })
      if (rawResult != null) {
        for (const row of rawResult) {
          logger.debug(JSON.stringify(row))
          const lineItemEmbedding = await extractChat.getEmbeddings({ text: row['rawLineItem'] })

          // Create a staging line item doc
          const stagingLineItem: StagingLineItemType = {
            rawLineItem: row['rawLineItem'],
            rawPeriod: row['rawPeriod'],
            rawLow: row['rawLow'],
            rawHigh: row['rawHigh'],
            rawUnit: row['rawUnit'],
            rawScale: row['rawScale'],
            metricType: row['metricType'],
            rawTranscriptParagraph: doc['pageContent'],
            rawTranscriptSourceSentence: row['rawTranscriptSourceSentence'],
            transcriptPosition: doc['metadata']['loc']['lines'],
            rawLineItemEmbedding: lineItemEmbedding,
          }
          stagingLineItems.push(stagingLineItem)
        }
      } else {
        logger.debug('No line items found: ', rawResult)
      }
      const {
        sessionId,
        prompts,
        chatId,
        created,
        role,
        content,
        functionName,
        functionArgs,
        finishReason,
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
      } = response

      gptLog.lineItems.push({
        sessionId,
        chatId,
        chatgptCreatedAt: new Date(created * 1000),
        baseContext: prompts.content,
        prompt: extractJSON.content,
        role,
        content,
        functionName,
        functionArguments: functionArgs,
        finishReason,
        promptTokens,
        completionTokens,
        totalTokens,
        promptCost: cost,
      })
    } catch (err) {
      logger.error(err)
    }
  }

  const processingEndTime = new Date()
  await StagingTranscript.findByIdAndUpdate(stagingTranscriptId, {
    processingStage: StagingTranscriptProcessingStage.DONE,
    stagingLineItems: stagingLineItems,
  })

  gptLog.durationMetrics = {
    start: processingStartTime,
    end: processingEndTime,
  }
  await GPTLog.create(gptLog)

  logger.info(
    `Finish processing raw transcript ${rawTranscriptId} to staging transcript line item ${stagingTranscriptId}`,
  )
  return stagingTranscriptId
}

async function testProcessingTranscripts() {
  const tickers = ['NVDA']

  for (const ticker of tickers) {
    const rawTranscripts = await RawTranscript.findOne({ companyTicker: ticker })
    logger.info('Starting Ticker: ', ticker)
    const test = await processRawTranscriptToStaging(rawTranscripts._id)
    logger.info('Processed transcript: ', ticker, '\n', test)
  }
}

// testProcessingTranscripts()
