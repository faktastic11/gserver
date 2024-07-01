import { makeMongoURI } from 'config/envVariables'
import csv from 'csv-parser'
import fs from 'fs'
import { RawTranscript } from 'models'
import mongoose from 'mongoose'
import { OpenAiApiHelper } from 'services/openai'
import { promisify } from 'util'
import { readPrompt } from './processRawTranscriptToStaging'
import { GPTPrompt } from './prompt'

interface gptTrainingExample {
  messages: object[]
}

const readdir = promisify(fs.readdir)
const writeFile = promisify(fs.writeFile)

export default async function createTrainingFile(prod: false) {
  console.log('running')
  await mongoose.connect(makeMongoURI('transcripts'))

  const results: Array<gptTrainingExample> = []

  const extractionJSON = readPrompt('prompts/extraction_prompt.json')
  const extractJSON = extractionJSON['extract_line_items']
  const filePath = './data/training/trainingFile.txt'

  try {
    const files = await readdir('./data/training')

    const fileProcessingPromises = files
      .filter((file) => file.endsWith('.csv'))
      .map((file) => {
        return new Promise<void>((resolve, reject) => {
          const dataPromises: Promise<void>[] = []

          fs.createReadStream(`./data/${file}`)
            .pipe(csv())
            .on('data', (data) => {
              const dataPromise = (async () => {
                const { rawTranscriptParagraph, rawTranscriptId } = data
                const rawTranscript = await RawTranscript.findOne({ id: rawTranscriptId })

                const extractPrompt = new GPTPrompt({
                  role: 'user',
                  content: extractJSON['content'],
                  metaData: {
                    companyName: rawTranscript.companyName,
                    thisQuarter: 'Q' + rawTranscript.fiscalQuarter,
                    thisYear: rawTranscript.fiscalYear,
                    nextQuarter: 'Q' + (rawTranscript.fiscalQuarter + 1),
                    nextYear: rawTranscript.fiscalYear + 1,
                    excerpt: rawTranscriptParagraph,
                  },
                  responseType: extractJSON['response_type'],
                  temp: 0,
                })

                const assistantData = {
                  rawLineItem: data.rawLineItem,
                  rawPeriod: data.rawPeriod,
                  rawLow: data.rawLow,
                  rawHigh: data.rawHigh,
                  rawUnit: data.rawUnit,
                  rawScale: data.rawScale,
                  metricType: data.metricType,
                  rawTranscriptSourceSentence: data.rawTranscriptSourceSentence,
                }
                const formattedAssistantData = `[${JSON.stringify(assistantData)}]`

                const formattedData = {
                  messages: [
                    { system: extractPrompt.content },
                    { user: data.RawSourceParagraph },
                    { assistant: formattedAssistantData },
                  ],
                }
                results.push(formattedData)
              })()

              dataPromises.push(dataPromise)
            })
            .on('end', () => {
              Promise.all(dataPromises)
                .then(() => resolve())
                .catch(reject)
            })
            .on('error', reject)
        })
      })

    await Promise.all(fileProcessingPromises)

    await writeFile(filePath, JSON.stringify(results, null, 4))
    console.log('Successfully written to file')
  } catch (err) {
    console.error('Error:', err)
  }

  if (prod) {
    uploadTrainingFile(filePath)
  }
}

function uploadTrainingFile(path: string) {
  const openAI = new OpenAiApiHelper({ maxRetries: 2, timeout: 10000 })
  openAI.finetuneModel(path)
}
