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
const csv_reader_1 = __importDefault(require("csv-reader"));
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const models_1 = require("../../models");
dotenv.config({ path: `${process.cwd()}/.env` });
const mongoose_1 = __importDefault(require("mongoose"));
const envVariables_1 = require("../../config/envVariables");
const parseLineItemValue = (value) => {
    // this is really just tailored to seed data we've cleaned already
    if (value.split(' ').length > 1) {
        return { amt: null, unit: null, qualitative: true };
    }
    if (value[0] === '$') {
        return { amt: parseFloat(value.slice(1).replace(/,/g, '')), unit: 'USD', qualitative: false };
    }
    if (value[value.length - 1] === '%') {
        return { amt: parseFloat(value.slice(0, value.length - 1)), unit: 'percent', qualitative: false };
    }
    return { amt: null, unit: null, qualitative: true };
};
// parse time period from csv
const parseTimePeriod = (timePeriod) => {
    const [w1, w2] = timePeriod.split(' ');
    if (w1 === 'Fiscal') {
        // Fiscal 2024
        return { fiscalQuarter: null, fiscalYear: Number(w2) };
    }
    else {
        // Q1 2024
        return { fiscalQuarter: Number(w1.slice(1)), fiscalYear: Number(w2) };
    }
};
// this function takes csv for a cleaned transcript line items and inserts them as separate
// documents into the processedTranscripts collection
const insertProcessedTranscript = () => __awaiter(void 0, void 0, void 0, function* () {
    // read csv file
    yield mongoose_1.default.connect((0, envVariables_1.makeMongoURI)('transcripts'));
    const ticker = 'ADSK';
    const dateOfRecord = new Date('2023-05-25T21:00:00.000Z');
    const filePath = `${process.cwd()}/data/ADSK_Q1_2024_Cleaned.csv`;
    const inputStream = fs.createReadStream(filePath, 'utf8');
    inputStream
        .pipe((0, csv_reader_1.default)({ parseNumbers: true, parseBooleans: true, trim: true, asObject: true }))
        .on('data', (row) => __awaiter(void 0, void 0, void 0, function* () {
        // row is an array of CSV column data mapped to object properties
        const { lineItemName, timePeriod, low, high, sourceSentence, valueCategory } = row;
        const { amt: amtLow, unit: unitLow, qualitative: qualitativeLow } = parseLineItemValue(low);
        const { amt: amtHigh, unit: unitHigh, qualitative: qualitativeHigh } = parseLineItemValue(high);
        const { fiscalQuarter: guidanceQtr, fiscalYear: guidanceYr } = parseTimePeriod(timePeriod);
        const newProcessedDoc = yield models_1.ProcessedTranscript.create({
            companyTicker: ticker,
            companyName: ticker,
            guidancePeriod: {
                fiscalQuarter: guidanceQtr,
                fiscalYear: guidanceYr,
                raw: timePeriod,
            },
            transcriptPeriod: {
                fiscalQuarter: 1,
                fiscalYear: 2024,
                reportDate: dateOfRecord,
            },
            lineItem: lineItemName,
            metricType: 'Guidance',
            valueCategory,
            value: Object.assign(Object.assign(Object.assign(Object.assign({}, (amtLow && { low: { amt: amtLow, unit: unitLow } })), (amtHigh && { high: { amt: amtHigh, unit: unitHigh } })), (amtLow && amtHigh && { mid: { amt: (amtLow + amtHigh) / 2, unit: unitLow } })), (qualitativeLow && { qualitative: low })),
            rawTranscriptSourceSentence: sourceSentence,
            rawTranscriptId: '64dc3725a374406d3ca87ee7',
        });
    }));
});
insertProcessedTranscript();
//# sourceMappingURL=seedDBCleanedTranscript_old.js.map