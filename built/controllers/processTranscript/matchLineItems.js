"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csv_writer_1 = require("csv-writer");
// Define the CSV writer for all matches
const allMatchesCsvWriter = (0, csv_writer_1.createObjectCsvWriter)({
    path: './data/all_matches.csv',
    header: [
        { id: 'rawLineItem', title: 'Raw Line Item' },
        { id: 'rawTranscriptLineItem', title: 'Raw Transcript Line Item' },
        { id: 'previousLineItem', title: 'Previous Line Item' },
        { id: 'filteredItemLineItem', title: 'Filtered Item Line Item' },
        { id: 'similarity', title: 'Similarity' },
        { id: 'gpt4Response', title: 'GPT-4 Response' },
        { id: 'matchType', title: 'Match Type' },
    ],
});
//TODO: fix to work with new staging transcript shape
// function findBestMatchingItems(
//   currentLineItem: StagingTranscriptDoc,
//   previousQuarterItems: StagingTranscriptDoc[],
// ): similarityScore[] {
//   const similarityScores = previousQuarterItems.map((lineItem) => ({
//     lineItem,
//     similarity: similarity(currentLineItem.rawLineItemEmbedding, lineItem.rawLineItemEmbedding),
//   }))
//   similarityScores.sort((a, b) => b.similarity - a.similarity) // Sort in descending order
//   const top5Matches = similarityScores.slice(0, 5)
//   return top5Matches
// }
// async function matchItemsDriver(currentLineItem: StagingTranscriptDoc, local: boolean): Promise<MatchData[]> {
//   const { rawTranscriptId } = currentLineItem
//   const rawTranscript = await RawTranscript.findOne({ _id: rawTranscriptId })
//   const matchedData = []
//   if (!rawTranscript) {
//     throw new Error(`RawTranscript not found for parameters`)
//   }
//   const { fiscalQuarter, fiscalYear } = rawTranscript
//   const { quarter: previousQuarter, year: previousYear } = getPreviousFiscalQuarter(fiscalQuarter, fiscalYear)
//   const previousTranscript = await RawTranscript.findOne({
//     companyTicker: rawTranscript.companyTicker,
//     fiscalQuarter: previousQuarter,
//     fiscalYear: previousYear,
//   })
//   if (!previousTranscript) {
//     throw new Error(`RawTranscript not found for parameters`)
//   }
//   const previousQuarterLineItems = await StagingTranscript.find({
//     rawTranscriptId: previousTranscript.id,
//     metricType: 'guidance',
//   })
//   const filteredItems = findBestMatchingItems(currentLineItem, previousQuarterLineItems)
//   const topMatch = filteredItems[0]
//   if (filteredItems.length > 0 && topMatch.similarity >= 0.99) {
//     // If the first item has a similarity of 1, return early
//     console.log('exact match found')
//     if (local) {
//       const perfectMatchData = {
//         rawLineItem: currentLineItem.rawLineItem,
//         rawTranscriptLineItem: currentLineItem.rawTranscriptSourceSentence,
//         previousLineItem: topMatch.lineItem.rawLineItem,
//         filteredItemLineItem: topMatch.lineItem.rawTranscriptSourceSentence,
//         similarity: topMatch.similarity,
//         gpt4Response: '',
//         matchType: 'perfect match',
//       }
//       matchedData.push(perfectMatchData)
//     }
//   } else if (filteredItems.length > 0 && topMatch.similarity > 0.8) {
//     const data = fs.readFileSync('prompts/match_prompt.json', 'utf8')
//     const matchJson = JSON.parse(data)
//     const openai = new OpenAiApiHelper({ maxRetries: 5, timeout: 20000 })
//     matchJson[1]['content'] =
//       currentLineItem.rawTranscriptSourceSentence + `And the fiscal quarter is ${fiscalQuarter} ${fiscalYear}`
//     for (const item of filteredItems) {
//       matchJson[2]['content'] =
//         item.lineItem.rawTranscriptSourceSentence + `And the fiscal quarter is ${previousQuarter} ${previousYear}`
//       const chatCompletion = await openai.createChatCompletion({
//         messages: matchJson,
//         model: 'gpt-4',
//       })
//       console.log('parsing gpt responses')
//       //TODO: parse out the response and check if there is a match and change the current line to match the previous
//       // Parse the response from OpenAI
//       const responseMessage = chatCompletion.choices[0].message.content
//       console.log(responseMessage)
//       if (local) {
//         const otherMatchData = {
//           rawLineItem: currentLineItem.rawLineItem,
//           rawTranscriptLineItem: currentLineItem.rawTranscriptSourceSentence,
//           previousLineItem: item.lineItem.rawLineItem,
//           filteredItemLineItem: item.lineItem.rawTranscriptSourceSentence,
//           similarity: item.similarity,
//           gpt4Response: responseMessage,
//           matchType: 'near-perfect match',
//         }
//         matchedData.push(otherMatchData)
//       }
//     }
//   } else {
//     // No match
//     console.log('no match found')
//     if (local) {
//       for (const item of filteredItems) {
//         const noMatchData = {
//           rawLineItem: currentLineItem.rawLineItem,
//           rawTranscriptLineItem: currentLineItem.rawTranscriptSourceSentence,
//           previousLineItem: item.lineItem.rawLineItem,
//           filteredItemLineItem: item.lineItem.rawTranscriptSourceSentence,
//           similarity: item.similarity,
//           gpt4Response: '',
//           matchType: 'no match',
//         }
//         matchedData.push(noMatchData)
//       }
//     }
//   }
//   console.log('done')
//   return matchedData
// }
// function getPreviousFiscalQuarter(currentQuarter: number, currentYear: number): { quarter: number; year: number } {
//   let previousQuarter = currentQuarter - 1
//   let previousYear = currentYear
//   if (previousQuarter === 0) {
//     previousQuarter = 4
//     previousYear -= 1
//   }
//   return { quarter: previousQuarter, year: previousYear }
// }
// export async function getMatches() {
//   await mongoose.connect(makeMongoURI('transcripts'))
//   const matchedData = []
//   const trs = await StagingTranscript.find({
//     rawTranscriptId: '64d9bd8f21bb5d8c5923cb9a',
//     metricType: 'guidance',
//   }).limit(10)
//   if (!trs) {
//     throw new Error('No documents matching that description')
//   }
//   console.log(trs)
//   for (const doc of trs) {
//     const matchData = await matchItemsDriver(doc, true)
//     matchedData.push(...matchData)
//   }
//   await allMatchesCsvWriter.writeRecords(matchedData)
//   console.log('Data saved to all_matches.csv')
// }
//# sourceMappingURL=matchLineItems.js.map