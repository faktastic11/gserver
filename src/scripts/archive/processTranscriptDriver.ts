// import { format } from 'date-fns'
// import * as fs from 'fs'
// import { RawTranscript, RawTranscriptDoc, StagingTranscriptType } from 'models'
// import path from 'path'
// import { processTranscript, promptConfig } from '../controllers/processTranscript/'
// import { OpenAiApiHelper } from '../services/openai'

// const opneai = new OpenAiApiHelper({ maxRetries: 3, timeout: 20000 })

// async function runProcessTranscripts(
//   promptConfig: promptConfig,
//   document: RawTranscriptDoc,
//   model = 'gpt-4',
// ): Promise<StagingTranscriptType[]> {
//   const { _id, companyName, companyTicker, fiscalYear, fiscalQuarter } = document
//   const processedTranscript = await processTranscript(
//     {
//       _id,
//       companyName,
//       companyTicker,
//       fiscalYear,
//       fiscalQuarter,
//     },
//     promptConfig,
//     document,
//     model,
//   )

//   return processedTranscript
// }

// async function main(tickers: string[]): Promise<void> {
//   const today = new Date()
//   const timestamp = format(today, 'yyyy-MM-dd-HH:mm')

//   const oneShotConfig = JSON.parse(fs.readFileSync('prompts/oneshot_prompt.json', 'utf8'))

//   const processedLineItems: StagingTranscriptType[] = []

//   for (const ticker of tickers) {
//     const documents = await RawTranscript.find({ ticker })
//     for (const document of documents) {
//       const financialLineItems = await runProcessTranscripts(oneShotConfig, document, 'gpt-4')
//       processedLineItems.push(...financialLineItems)
//     }

//     if (process.env.NODE_ENV === 'production') {
//       const outputPath = path.join('test_data', `${ticker}_extract_${timestamp}.csv`)
//       // Use the appropriate method to save data to CSV
//     }
//   }

//   console.log(processedLineItems)
// }

// const tickers = ['ADBE']
// main(tickers)
