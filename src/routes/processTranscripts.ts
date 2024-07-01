import { logApiError } from 'controllers/error'
import { initTranscriptProcessing } from 'controllers/processTranscript'
import express from 'express'
import Joi from 'joi'
import { RawTranscript } from 'models'
import { getRegLogger } from 'util/loggers'
import validateFn, { reqTargetTypes } from 'validators'

const logger = getRegLogger(__filename)

const router = express.Router()

const processTranscriptsValidation = (req, res, next) => {
  const bodySchema = Joi.object({
    companyTicker: Joi.string(),
    transcriptYear: Joi.number(),
    transcriptQuarter: Joi.number(),
  })

  validateFn(req, res, next, [{ schema: bodySchema, reqTarget: reqTargetTypes.BODY }])
}

router.post('/v1/processTranscripts', processTranscriptsValidation, async (req, res, next) => {
  const { companyTicker, transcriptYear, transcriptQuarter } = req.body

  try {
    const rawTranscript = await RawTranscript.findOne({ companyTicker, transcriptYear, transcriptQuarter })
    if (!rawTranscript) throw Error(`RawTranscript not found for parameters`)
    const processedTranscripts = await initTranscriptProcessing(rawTranscript.id)
    return res.status(200).send()
  } catch (err) {
    return logApiError(req, res, next, err, 500, 'Could not process transcripts')
  }
})

export default router
