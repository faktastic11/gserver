import { NextFunction, Request, Response } from "express";
import {
  ProcessedTranscript,
  RawTranscript,
  UserHistory,
  Company,
  GuidanceRevisions,
  StagingTranscript,
} from "models";
import { AuthenticatedRequest } from "../util/ types";

export const getTickerGuidance = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { companyTicker, fiscalYear, fiscalQuarter, metricType } = req.query;
  const pipeline = [
    {
      $match: {
        companyTicker: companyTicker,
        ...(fiscalYear && { fiscalYear: Number(fiscalYear) }),
        ...(fiscalQuarter && { fiscalQuarter: fiscalQuarter }),
        ...(metricType && { "stagingLineItems.metricType": metricType }),
      },
    },
    {
      $unwind: "$stagingLineItems",
    },
    {
      $match: {
        ...(metricType && { "stagingLineItems.metricType": metricType }),
      },
    },
    {
      $project: {
        _id: 0,
        companyTicker: 1,
        "stagingLineItems.rawPeriod": 1,
        "stagingLineItems.rawLineItem": 1,
        "stagingLineItems.rawLow": 1,
        "stagingLineItems.rawHigh": 1,
        "stagingLineItems.rawTranscriptSourceSentence": 1,
        "stagingLineItems.rawTranscriptParagraph.page_content": 1,
      },
    },
  ];

  const guidance = await StagingTranscript.aggregate(pipeline);

  return res.send({ guidance });
};

export const getCompanyGuidancePeriods = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { companyTicker } = req.params;

  const periods = (
    await ProcessedTranscript.aggregate([
      { $match: { companyTicker } },
      {
        $group: {
          _id: {
            year: "$guidancePeriod.fiscalYear",
            quarter: "$guidancePeriod.fiscalQuarter",
          },
        },
      },
    ])
  )
    .map((doc) => doc._id)
    .filter(({ year, quarter }) => year || quarter);

  return res.send({ companyTicker, guidancePeriods: periods });
};

export const getCompanyGuidanceTranscripts = async (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { companyTicker } = req.params;
    const [periods, company] = await Promise.all([
      StagingTranscript.aggregate([
        { $match: { companyTicker } },
        { $group: { _id: { year: "$fiscalYear", quarter: "$fiscalQuarter" } } },
      ])
        .exec()
        .then((docs) => docs.map((doc) => doc._id))
        .then((ids) => ids.filter(({ year, quarter }) => year && quarter)),
      Company.findOne({ companyTicker }).exec(),
    ]);

    const companyName = company?.companyName || companyTicker;
    const { userId } = req.user;

    let userHistory = await UserHistory.findOne({ userId }).exec();
    if (!userHistory) {
      userHistory = new UserHistory({ userId, searches: [] });
    }

    const searches = userHistory.searches.filter(
      (item) => item !== companyTicker,
    );
    searches.push(companyTicker);
    await UserHistory.findOneAndUpdate(
      { userId },
      { searches },
      { upsert: true, new: true },
    ).exec();
    return res.send({ companyTicker, companyName, transcriptPeriods: periods });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the transcripts" });
  }
};

export const getGuidanceCompanies = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // const { limit, skip } = req.query - we don't need these for now

  const companies = await StagingTranscript.distinct("companyTicker");
  return res.send({ companies: companies.filter((c) => c) });
};

export const getGuidanceRevisions = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { companyTicker, fiscalYear, metricType } = req.query;

    if (!companyTicker || !fiscalYear || !metricType) {
      return res.status(400).json({
        error: "company ticker, fiscal year, and metric type are required",
      });
    }

    const data = await GuidanceRevisions.findOne({
      companyTicker: companyTicker as string,
      fiscalYear: parseInt(fiscalYear as string, 10),
      metricType: metricType as string,
    });

    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
