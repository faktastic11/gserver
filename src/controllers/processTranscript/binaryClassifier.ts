import * as fs from 'fs'
import mongoose from 'mongoose'
import OpenAi from 'openai'
import { makeMongoURI } from '../../config/envVariables'
import { RawTranscript, RawTranscriptDoc } from '../../models'
import { OpenAiApiHelper } from '../../services/openai'
import { getRegLogger } from '../../util/loggers'

const logger = getRegLogger(__filename)

const openai = new OpenAiApiHelper({ maxRetries: 5, timeout: 20000 })

let topicJson = []
try {
  const data = fs.readFileSync('prompts/guidance_prompt.json', 'utf8')
  topicJson = JSON.parse(data)
} catch (err) {
  logger.error('Error reading the file:', err)
}

function hasProperPunctuation(text: string): boolean {
  const trimmedText = text.trim()
  return ['.', '!', '?'].includes(trimmedText.slice(-1))
}

export async function binaryClassification(rawDoc: RawTranscriptDoc, local: boolean) {
  const { _id, companyTicker, fiscalYear, fiscalQuarter, transcript } = rawDoc
  logger.info(`classifying transcript ${_id}`)

  await Promise.all(
    transcript.map(async (line) => {
      const { text } = line
      if (!hasProperPunctuation(text)) {
        return
      }
      topicJson[1]['content'] = text
      topicJson[2]['content'] = `Keep in mind that the fiscal year is ${fiscalYear},
     the fiscal quarter is Q${fiscalQuarter} and the company is ${companyTicker}`

      const chatCompletion = await openai.createChatCompletion({
        messages: topicJson,
        model: 'gpt-3.5-turbo',
      })

      const result = chatCompletion.choices[0].message.content.trim()
      line['processFurther'] = result.toLowerCase().includes('true')
    }),
  )

  if (local) {
    logger.info(`saving to csv file`)
    const csvStream = fs.createWriteStream('./data/output.csv')
    csvStream.write('Text,FurtherProcess\n')
    for (const line of transcript) {
      if (hasProperPunctuation(line['text'])) {
        csvStream.write(`"${line['text']}",${line['processFurther']}\n`)
      }
    }
    csvStream.end()
  } else {
    rawDoc.save().catch((err) => logger.error(err))
  }
}

async function getTranscripts() {
  await mongoose.connect(makeMongoURI('transcripts'))

  const trs = await RawTranscript.find({
    companyTicker: 'AAPL',
    fiscalYear: '2023',
    fiscalQuarter: '1',
  })
  if (!trs) {
    throw new Error('No documents matching that description')
  }
  console.log(trs)

  await binaryClassification(trs[0], true)
}
