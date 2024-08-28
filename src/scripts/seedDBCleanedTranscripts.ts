/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from "dotenv";
import * as fs from "fs";
import XLSX from "xlsx";
import { ProcessedTranscript, RawTranscript } from "../models";

dotenv.config({ path: `${process.cwd()}/.env` });

import { raw } from "body-parser";
import mongoose from "mongoose";
import { makeMongoURI } from "../config/envVariables";

const isNumber = (str: string): number | boolean => {
  return !isNaN(parseFloat(str)) && isFinite(Number(str));
};
const isNone = (str: string): boolean => str.toLowerCase().trim() === "none";

const getScaleMultiplier = (scale: string): number => {
  if (!scale) return 1;
  scale = `${scale}`.toLowerCase();
  if (scale.includes("thousand")) return 1000;
  else if (scale.includes("million")) return 1000000;
  else if (scale.includes("billion")) return 1000000000;
  else if (scale.includes("trillion")) return 1000000000000;
  else {
    if (scale && !isNone(scale)) console.log(`WARNING: unknown scale ${scale}`);
    return 1;
  }
};
const parseLineItemValue = (
  row: CleanedRowType,
): { amtLow: number | null; amtHigh: number | null } => {
  const { rawLow, rawHigh, rawScale } = row;

  const scaleMultiplier = getScaleMultiplier(rawScale);
  const amtLow = isNumber(rawLow) ? parseFloat(rawLow) * scaleMultiplier : null;
  const amtHigh = isNumber(rawHigh)
    ? parseFloat(rawHigh) * scaleMultiplier
    : null;

  return { amtLow, amtHigh };
};

const parseGuidanceTimePeriod = (
  timePeriod: string,
  { tQuarter, tYear }: { tQuarter: number; tYear: number },
): { guidanceQuarter: number | null; guidanceYear: number | null } => {
  try {
    timePeriod = `${timePeriod}`?.toLowerCase()?.trim();
  } catch (err) {
    console.log(`WARNING: unknown time period ${timePeriod}`);
    return { guidanceQuarter: null, guidanceYear: null };
  }
  if (
    timePeriod !== "this quarter" &&
    timePeriod !== "this year" &&
    timePeriod !== "next quarter" &&
    timePeriod !== "next year"
  ) {
    console.log(`WARNING: unknown time period ${timePeriod}`);
    return { guidanceQuarter: null, guidanceYear: null };
  }
  const [w1, w2] = timePeriod.split(" ");
  let guidanceQuarter = tQuarter;
  let guidanceYear = tYear;

  if (w1 === "this") {
    if (w2 === "quarter") {
      return { guidanceQuarter, guidanceYear };
    } else if (w2 === "year") {
      guidanceQuarter = null;
    }
  } else if (w1 === "next") {
    if (w2 === "quarter") {
      guidanceQuarter = guidanceQuarter === 4 ? 1 : guidanceQuarter + 1;
      guidanceYear = guidanceQuarter === 1 ? guidanceYear + 1 : guidanceYear;
      return { guidanceQuarter, guidanceYear };
    } else if (w2 === "year") {
      guidanceYear += 1;
      return { guidanceQuarter: null, guidanceYear };
    }
  }

  return { guidanceQuarter, guidanceYear };
};

const parseTranscriptPosition = (
  transcriptPosition: string,
): { startLine: number; endLine: number } => {
  const [startLine, endLine] = transcriptPosition
    .split(" ")
    .map((n) => parseInt(n))
    .filter((n) => !isNaN(n));
  return { startLine, endLine };
};

interface CleanedRowType {
  action: string;
  comments: string;
  rawTranscriptId: string;
  sessionId: string;
  rawLineItem: string;
  rawPeriod: string;
  rawLow: string;
  rawHigh: string;
  rawUnit: string;
  rawScale: string;
  metricType: string;
  rawTranscriptSourceSentence: string;
  rawTranscriptParagraph: string;
  transcriptPosition: string;
}

// this function takes csv for a cleaned transcript line items and inserts them as separate
// documents into the processedTranscripts collection
const insertProcessedTranscripts = async (filePath, deleteCurrent = true) => {
  // get file name from file path
  const [ticker, quarter, fiscalYearStr] = filePath
    .split("/")
    .pop()
    .split(".")[0]
    .split("_")
    .slice(0, 3);
  const fiscalQuarter = Number(quarter[1]);
  const fiscalYear = Number(fiscalYearStr);

  console.log(
    `START - processing transcript. ${ticker} ${fiscalQuarter} ${fiscalYear}`,
  );
  const rawTranscript = await RawTranscript.findOne({
    companyTicker: ticker,
    fiscalQuarter,
    fiscalYear,
  });
  console.log(rawTranscript?.id || "no raw transcript found");

  // overwrite existing processed transcript data
  if (deleteCurrent) {
    await ProcessedTranscript.deleteMany({
      rawTranscriptId: rawTranscript?.id,
    });
  }

  const sheetData = XLSX.read(filePath, { type: "file" });
  const sheetName = sheetData.SheetNames[0];
  const sheet = sheetData.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet) as CleanedRowType[];

  const errorRows = [];

  for (const row of rows) {
    const {
      action,
      comments,
      rawTranscriptId,
      sessionId,
      rawLineItem,
      rawPeriod,
      rawLow,
      rawHigh,
      rawUnit,
      rawScale,
      metricType,
      rawTranscriptSourceSentence,
      rawTranscriptParagraph,
      transcriptPosition,
    } = row;

    try {
      if (
        action?.toLowerCase().includes("delete") ||
        !metricType?.toLowerCase().includes("guidance")
      ) {
        continue;
      }

      const { guidanceQuarter, guidanceYear } = parseGuidanceTimePeriod(
        rawPeriod,
        {
          tQuarter: fiscalQuarter,
          tYear: fiscalYear,
        },
      );

      const { amtLow, amtHigh } = parseLineItemValue(row);

      const { startLine, endLine } = transcriptPosition
        ? parseTranscriptPosition(transcriptPosition)
        : { startLine: null, endLine: null };

      const newProcessedDoc = await ProcessedTranscript.create({
        companyTicker: ticker,
        companyName: ticker,
        guidancePeriod: {
          fiscalQuarter: guidanceQuarter,
          fiscalYear: guidanceYear,
          raw: rawPeriod,
        },
        transcriptPeriod: {
          fiscalQuarter: rawTranscript.fiscalQuarter,
          fiscalYear: rawTranscript.fiscalYear,
          reportDate: rawTranscript.dateOfRecord,
        },
        lineItem: rawLineItem,
        metricType: "Guidance",
        valueCategory: "unknown",
        value: {
          raw: { low: rawLow, high: rawHigh, unit: rawUnit, scale: rawScale },
          ...(amtLow && { low: { amt: amtLow, unit: rawUnit } }),
          ...(amtHigh && { high: { amt: amtHigh, unit: rawUnit } }),
          ...(amtLow &&
            amtHigh && { mid: { amt: (amtLow + amtHigh) / 2, unit: rawUnit } }),
        },
        rawTranscriptSourceSentence: rawTranscriptSourceSentence,
        rawTranscriptSourceParagraph: rawTranscriptParagraph,
        ...(transcriptPosition && {
          transcriptPosition: {
            startLine,
            endLine,
          },
        }),
        rawTranscriptId: rawTranscript.id,
      });
    } catch (err) {
      console.log(err);
      console.log("ERROR - processing row", filePath, row);
      errorRows.push({ err, row, filePath });
    }
  }

  console.log(
    `FINISH - processed transcript. ${ticker} ${fiscalQuarter} ${fiscalYear}`,
  );

  return errorRows;
};

const processAllCleanedTranscripts = async () => {
  console.log("START - processing all cleaned transcripts");
  await mongoose.connect(makeMongoURI("transcripts"));

  /*put cleaned transcript file path below. All files in this folder will be processed and they need to be in the format of 
    <ticker>_<quarter>_<year>_cleaned.xlsx 
    <ticker>_<quarter>_<year>_clean.xlsx
    <ticker>_<quarter>_<year>.xlsx
  */
  const baseFilePath = `${process.cwd()}/data/cleaned-24-01-04`;
  const cleanedTranscriptNames = fs.readdirSync(baseFilePath);

  // const cleanedTranscriptNames = ['ABT_Q2_2023_cleaned.xlsx']
  const erroredTranscripts = await Promise.all(
    cleanedTranscriptNames.map(async (transcriptFileName) => {
      if (transcriptFileName[0] === ".") return;
      try {
        return await insertProcessedTranscripts(
          `${baseFilePath}/${transcriptFileName}`,
        );
      } catch (err) {
        console.log(err);
        console.log("ERROR - processing transcript", transcriptFileName);
      }
    }),
  );

  console.log("FINISH - processing all cleaned transcripts");
  console.log("errored transcripts");
  console.log(erroredTranscripts.flat());
};

processAllCleanedTranscripts();
