import { RawTranscript } from '../../models'
import processRawTranscriptToStaging from './processRawTranscriptToStaging'
import processStagingTranscriptToProcessed from './processStagingTranscriptToProcessed'
import createTrainingFile from './trainGPT'

import { getRegLogger } from 'util/loggers'

const logger = getRegLogger('initTranscriptProcessing')
// function to process the entire pipeline for a transcript
export const initTranscriptProcessing = async (RawTranscriptId: string) => {
  const transcript = await RawTranscript.findOne({ _id: RawTranscriptId })
  if (!transcript) throw Error(`Transcript not found for id ${RawTranscriptId}`)

  logger.info(`Processing transcript ${transcript._id}`)

  // call pipeline function from raw --> staging transcript
  const stagingTranscriptId = await processRawTranscriptToStaging(RawTranscriptId)
  // call pipeline function from staging --> process transcript
  const processedTranscriptIds = await processStagingTranscriptToProcessed(stagingTranscriptId)

  logger.info(`Finished Processing transcript ${transcript._id}`)

  return processedTranscriptIds
}
