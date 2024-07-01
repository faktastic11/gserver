import { NextFunction, Request, Response } from 'express'
import { RawTranscript } from 'models'

export const getRawTranscripts = async (req: Request, res: Response, _next: NextFunction) => {
  const { companyTicker, transcriptYear, transcriptQuarter } = req.query
  console.log({
    ...(companyTicker && { companyTicker }),
    ...(transcriptYear && { fiscalYear: transcriptYear }),
    ...(transcriptQuarter && { fiscalQuarter: transcriptQuarter }),
  })
  const transcripts = await RawTranscript.find({
    ...(companyTicker && { companyTicker }),
    ...(transcriptYear && { fiscalYear: transcriptYear }),
    ...(transcriptQuarter && { fiscalQuarter: transcriptQuarter }),
  })

  return res.send({ transcripts })
}
