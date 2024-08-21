import { NextFunction, Request, Response } from 'express'
import { ProcessedTranscript, RawTranscript, UserHistory, Company } from 'models'

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

export const getCompanyGuidanceTranscripts = async (req: Request | any, res: Response, _next: NextFunction) => {
  try {
    const { companyTicker } = req.params
    const [periods, company] = await Promise.all([
      ProcessedTranscript.aggregate([
        { $match: { companyTicker } },
        { $group: { _id: { year: '$transcriptPeriod.fiscalYear', quarter: '$transcriptPeriod.fiscalQuarter' } } },
      ])
        .exec()
        .then((docs) => docs.map((doc) => doc._id))
        .then((ids) => ids.filter(({ year, quarter }) => year && quarter)),
      Company.findOne({ companyTicker }).exec(),
    ])

    const companyName = company?.companyName || companyTicker
    const { userId } = req.user

    let userHistory = await UserHistory.findOne({ userId }).exec()
    if (!userHistory) {
      userHistory = new UserHistory({ userId, searches: [] })
    }

    const searches = userHistory.searches.filter((item) => item !== companyTicker)
    searches.push(companyTicker)
    await UserHistory.findOneAndUpdate({ userId }, { searches }, { upsert: true, new: true }).exec()
    return res.send({ companyTicker, companyName, transcriptPeriods: periods })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error: 'An error occurred while fetching the transcripts' })
  }
}

export const getGuidanceCompanies = async (req: Request, res: Response, _next: NextFunction) => {
  // const { limit, skip } = req.query - we don't need these for now

  const companies = await ProcessedTranscript.distinct('companyTicker')
  return res.send({ companies: companies.filter((c) => c) })
}
