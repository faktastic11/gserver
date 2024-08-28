import { logApiError } from "controllers/error";
import { createObjectCsvWriter } from "csv-writer";
import { NextFunction, Response } from "express";
import {
  Company,
  RawTranscript,
  StagingTranscript,
  StagingTranscriptDoc,
  UserHistory,
} from "models";
import { Subset } from "../util";
import { AuthenticatedRequest } from "../util/ types";

type StagingTranscriptByPeriodObjT = Record<
  string,
  ({ period: string } & Subset<StagingTranscriptDoc>)[]
>;

// const writeTranscriptsToCsv = async (transcriptByPeriodObj: StagingTranscriptByPeriodObjT, companyTicker: string) => {
//   for (const period in transcriptByPeriodObj) {
//     // write to csv
//     const periodWriter = createObjectCsvWriter({
//       path: `./data/${companyTicker}_${period}.csv`,
//       header: [
//         { id: 'rawLineItem', title: 'Line Item' },
//         { id: 'period', title: 'Report Period' },
//         { id: 'metricType', title: 'Metric Type' },
//         { id: 'rawPeriod', title: 'Line Item Period' },
//         { id: 'rawLow', title: 'Low' },
//         { id: 'rawHigh', title: 'High' },
//         { id: 'rawUnit', title: 'Unit' },
//         { id: 'rawScale', title: 'Scale' },
//         { id: 'rawTranscriptSourceSentence', title: 'Source Sentence' },
//       ],
//     })

//     const filteredList = transcriptByPeriodObj[period].map((transcript) => {
//       const {
//         companyTicker,
//         period,
//         stagingLineItems,
//       } = transcript

//       const {        rawLineItem,
//         rawPeriod,
//         rawLow,
//         rawHigh,
//         rawUnit,
//         rawScale,
//         metricType,
//         rawTranscriptSourceSentence } = stagingLineItems
//         // rawTranscriptParagraph,}
//       return {
//         companyTicker,
//         period,
//         metricType,
//         rawLineItem,
//         rawLow,
//         rawHigh,
//         rawUnit,
//         rawScale,
//         rawPeriod,
//         rawTranscriptSourceSentence,
//       }
//     })

//     await periodWriter.writeRecords(filteredList)
//   }
// }

const stagingTranscriptDBToAPIMap = (
  stagingTranscript: StagingTranscriptDoc,
) => {
  const {
    companyName,
    companyTicker,
    stagingLineItems,
    fiscalQuarter,
    fiscalYear,
  } = stagingTranscript;

  // trim down the db values to only what we need for the api
  const stagingLineItemTrimmed = stagingLineItems.map(
    ({
      rawLineItem,
      rawPeriod,
      rawLow,
      rawHigh,
      rawUnit,
      rawScale,
      metricType,
      rawTranscriptSourceSentence,
      rawTranscriptParagraph,
    }) => {
      return {
        rawLineItem,
        rawPeriod,
        rawLow,
        rawHigh,
        rawUnit,
        rawScale,
        metricType,
        rawTranscriptSourceSentence,
        rawTranscriptParagraph,
      };
    },
  );

  return {
    companyName,
    companyTicker,
    fiscalQuarter,
    fiscalYear,
    stagingLineItems: stagingLineItemTrimmed,
  };
};

export const getStagingTranscriptsByCompany = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const companyTicker = req.query.companyTicker as string;

  const transcripts = await StagingTranscript.find({ companyTicker });

  const trnByPeriod: StagingTranscriptByPeriodObjT = {};

  const idToPeriod: Record<string, string> = {};
  for (const trn of transcripts) {
    const { rawTranscriptId } = trn;

    const transId = `${rawTranscriptId}`;
    let transcriptPeriod = idToPeriod[transId];

    if (!transcriptPeriod) {
      const rawTrn = await RawTranscript.findById(transId);
      if (!rawTrn) {
        logApiError(req, res, next, Error(`rawTrn not found ${transId}`), 500);
        continue;
      }

      idToPeriod[transId] = `${rawTrn?.fiscalYear} Q${rawTrn?.fiscalQuarter}`;
      transcriptPeriod = idToPeriod[transId];
    }

    if (!trnByPeriod[transcriptPeriod]) trnByPeriod[transcriptPeriod] = [];
    trnByPeriod[transcriptPeriod].push({
      period: transcriptPeriod,
      ...stagingTranscriptDBToAPIMap(trn),
    });
  }

  // writeTranscriptsToCsv(trnByPeriod, companyTicker)

  return res.send({ transcriptsByPeriod: trnByPeriod });
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
