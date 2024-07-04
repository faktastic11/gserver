"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const xlsx_1 = __importDefault(require("xlsx"));
const models_1 = require("../models");
dotenv.config({ path: `${process.cwd()}/.env` });
const mongoose_1 = __importDefault(require("mongoose"));
const envVariables_1 = require("../config/envVariables");
const isNumber = (str) => {
    return !isNaN(parseFloat(str)) && isFinite(Number(str));
};
const isNone = (str) => str.toLowerCase().trim() === 'none';
const getScaleMultiplier = (scale) => {
    if (!scale)
        return 1;
    scale = `${scale}`.toLowerCase();
    if (scale.includes('thousand'))
        return 1000;
    else if (scale.includes('million'))
        return 1000000;
    else if (scale.includes('billion'))
        return 1000000000;
    else if (scale.includes('trillion'))
        return 1000000000000;
    else {
        if (scale && !isNone(scale))
            console.log(`WARNING: unknown scale ${scale}`);
        return 1;
    }
};
const parseLineItemValue = (row) => {
    const { rawLow, rawHigh, rawScale } = row;
    const scaleMultiplier = getScaleMultiplier(rawScale);
    const amtLow = isNumber(rawLow) ? parseFloat(rawLow) * scaleMultiplier : null;
    const amtHigh = isNumber(rawHigh) ? parseFloat(rawHigh) * scaleMultiplier : null;
    return { amtLow, amtHigh };
};
const parseGuidanceTimePeriod = (timePeriod, { tQuarter, tYear }) => {
    var _a, _b;
    try {
        timePeriod = (_b = (_a = `${timePeriod}`) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.trim();
    }
    catch (err) {
        console.log(`WARNING: unknown time period ${timePeriod}`);
        return { guidanceQuarter: null, guidanceYear: null };
    }
    if (timePeriod !== 'this quarter' &&
        timePeriod !== 'this year' &&
        timePeriod !== 'next quarter' &&
        timePeriod !== 'next year') {
        console.log(`WARNING: unknown time period ${timePeriod}`);
        return { guidanceQuarter: null, guidanceYear: null };
    }
    const [w1, w2] = timePeriod.split(' ');
    let guidanceQuarter = tQuarter;
    let guidanceYear = tYear;
    if (w1 === 'this') {
        if (w2 === 'quarter') {
            return { guidanceQuarter, guidanceYear };
        }
        else if (w2 === 'year') {
            guidanceQuarter = null;
        }
    }
    else if (w1 === 'next') {
        if (w2 === 'quarter') {
            guidanceQuarter = guidanceQuarter === 4 ? 1 : guidanceQuarter + 1;
            guidanceYear = guidanceQuarter === 1 ? guidanceYear + 1 : guidanceYear;
            return { guidanceQuarter, guidanceYear };
        }
        else if (w2 === 'year') {
            guidanceYear += 1;
            return { guidanceQuarter: null, guidanceYear };
        }
    }
    return { guidanceQuarter, guidanceYear };
};
const parseTranscriptPosition = (transcriptPosition) => {
    const [startLine, endLine] = transcriptPosition
        .split(' ')
        .map((n) => parseInt(n))
        .filter((n) => !isNaN(n));
    return { startLine, endLine };
};
// this function takes csv for a cleaned transcript line items and inserts them as separate
// documents into the processedTranscripts collection
const insertProcessedTranscripts = (filePath_1, ...args_1) => __awaiter(void 0, [filePath_1, ...args_1], void 0, function* (filePath, deleteCurrent = true) {
    // get file name from file path
    const [ticker, quarter, fiscalYearStr] = filePath.split('/').pop().split('.')[0].split('_').slice(0, 3);
    const fiscalQuarter = Number(quarter[1]);
    const fiscalYear = Number(fiscalYearStr);
    console.log(`START - processing transcript. ${ticker} ${fiscalQuarter} ${fiscalYear}`);
    const rawTranscript = yield models_1.RawTranscript.findOne({ companyTicker: ticker, fiscalQuarter, fiscalYear });
    console.log((rawTranscript === null || rawTranscript === void 0 ? void 0 : rawTranscript.id) || 'no raw transcript found');
    // overwrite existing processed transcript data
    if (deleteCurrent) {
        yield models_1.ProcessedTranscript.deleteMany({ rawTranscriptId: rawTranscript === null || rawTranscript === void 0 ? void 0 : rawTranscript.id });
    }
    const sheetData = xlsx_1.default.read(filePath, { type: 'file' });
    const sheetName = sheetData.SheetNames[0];
    const sheet = sheetData.Sheets[sheetName];
    const rows = xlsx_1.default.utils.sheet_to_json(sheet);
    const errorRows = [];
    for (const row of rows) {
        const { action, comments, rawTranscriptId, sessionId, rawLineItem, rawPeriod, rawLow, rawHigh, rawUnit, rawScale, metricType, rawTranscriptSourceSentence, rawTranscriptParagraph, transcriptPosition, } = row;
        try {
            if ((action === null || action === void 0 ? void 0 : action.toLowerCase().includes('delete')) || !(metricType === null || metricType === void 0 ? void 0 : metricType.toLowerCase().includes('guidance'))) {
                continue;
            }
            const { guidanceQuarter, guidanceYear } = parseGuidanceTimePeriod(rawPeriod, {
                tQuarter: fiscalQuarter,
                tYear: fiscalYear,
            });
            const { amtLow, amtHigh } = parseLineItemValue(row);
            const { startLine, endLine } = transcriptPosition
                ? parseTranscriptPosition(transcriptPosition)
                : { startLine: null, endLine: null };
            const newProcessedDoc = yield models_1.ProcessedTranscript.create(Object.assign(Object.assign({ companyTicker: ticker, companyName: ticker, guidancePeriod: {
                    fiscalQuarter: guidanceQuarter,
                    fiscalYear: guidanceYear,
                    raw: rawPeriod,
                }, transcriptPeriod: {
                    fiscalQuarter: rawTranscript.fiscalQuarter,
                    fiscalYear: rawTranscript.fiscalYear,
                    reportDate: rawTranscript.dateOfRecord,
                }, lineItem: rawLineItem, metricType: 'Guidance', valueCategory: 'unknown', value: Object.assign(Object.assign(Object.assign({ raw: { low: rawLow, high: rawHigh, unit: rawUnit, scale: rawScale } }, (amtLow && { low: { amt: amtLow, unit: rawUnit } })), (amtHigh && { high: { amt: amtHigh, unit: rawUnit } })), (amtLow && amtHigh && { mid: { amt: (amtLow + amtHigh) / 2, unit: rawUnit } })), rawTranscriptSourceSentence: rawTranscriptSourceSentence, rawTranscriptSourceParagraph: rawTranscriptParagraph }, (transcriptPosition && {
                transcriptPosition: {
                    startLine,
                    endLine,
                },
            })), { rawTranscriptId: rawTranscript.id }));
        }
        catch (err) {
            console.log(err);
            console.log('ERROR - processing row', filePath, row);
            errorRows.push({ err, row, filePath });
        }
    }
    console.log(`FINISH - processed transcript. ${ticker} ${fiscalQuarter} ${fiscalYear}`);
    return errorRows;
});
const processAllCleanedTranscripts = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('START - processing all cleaned transcripts');
    yield mongoose_1.default.connect((0, envVariables_1.makeMongoURI)('transcripts'));
    /*put cleaned transcript file path below. All files in this folder will be processed and they need to be in the format of
      <ticker>_<quarter>_<year>_cleaned.xlsx
      <ticker>_<quarter>_<year>_clean.xlsx
      <ticker>_<quarter>_<year>.xlsx
    */
    const baseFilePath = `${process.cwd()}/data/cleaned-24-01-04`;
    const cleanedTranscriptNames = fs.readdirSync(baseFilePath);
    // const cleanedTranscriptNames = ['ABT_Q2_2023_cleaned.xlsx']
    const erroredTranscripts = yield Promise.all(cleanedTranscriptNames.map((transcriptFileName) => __awaiter(void 0, void 0, void 0, function* () {
        if (transcriptFileName[0] === '.')
            return;
        try {
            return yield insertProcessedTranscripts(`${baseFilePath}/${transcriptFileName}`);
        }
        catch (err) {
            console.log(err);
            console.log('ERROR - processing transcript', transcriptFileName);
        }
    })));
    console.log('FINISH - processing all cleaned transcripts');
    console.log('errored transcripts');
    console.log(erroredTranscripts.flat());
});
processAllCleanedTranscripts();
//# sourceMappingURL=seedDBCleanedTranscripts.js.map