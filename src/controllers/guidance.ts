import { NextFunction, Request, Response } from 'express'
import { ProcessedTranscript, RawTranscript } from 'models'

export const getTickerGuidance = async (req: Request, res: Response, _next: NextFunction) => {
  const { companyTicker, transcriptYear, transcriptQuarter, guidanceYear, guidanceQuarter } = req.query

  const guidance = await ProcessedTranscript.find({
    companyTicker,
    ...(transcriptYear && { 'transcriptPeriod.fiscalYear': transcriptYear }),
    ...(transcriptQuarter && { 'transcriptPeriod.fiscalQuarter': transcriptQuarter }),
    ...(guidanceYear && { 'guidancePeriod.fiscalYear': guidanceYear }),
    ...(guidanceQuarter && { 'guidancePeriod.fiscalQuarter': guidanceQuarter }),
  })

  return res.send({ guidance })
}

export const getCompanyGuidancePeriods = async (req: Request, res: Response, _next: NextFunction) => {
  const { companyTicker } = req.params

  const periods = (
    await ProcessedTranscript.aggregate([
      { $match: { companyTicker } },
      { $group: { _id: { year: '$guidancePeriod.fiscalYear', quarter: '$guidancePeriod.fiscalQuarter' } } },
    ])
  )
    .map((doc) => doc._id)
    .filter(({ year, quarter }) => year || quarter)

  return res.send({ companyTicker, guidancePeriods: periods })
}

export const getCompanyGuidanceTranscripts = async (req: Request, res: Response, _next: NextFunction) => {
  const { companyTicker } = req.params

  const periods = (
    await ProcessedTranscript.aggregate([
      { $match: { companyTicker } },
      { $group: { _id: { year: '$transcriptPeriod.fiscalYear', quarter: '$transcriptPeriod.fiscalQuarter' } } },
    ])
  )
    .map((doc) => doc._id)
    .filter(({ year, quarter }) => year && quarter)
  return res.send({ companyTicker, transcriptPeriods: periods })
}

export const getGuidanceCompanies = async (req: Request, res: Response, _next: NextFunction) => {
  // const { limit, skip } = req.query - we don't need these for now

  const companies = await ProcessedTranscript.distinct('companyTicker')
  return res.send({ companies: companies.filter((c) => c) })
}
