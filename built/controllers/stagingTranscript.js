"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStagingTranscriptsByCompany = void 0;
const error_1 = require("controllers/error");
const models_1 = require("models");
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
const stagingTranscriptDBToAPIMap = (stagingTranscript) => {
    const { companyName, companyTicker, stagingLineItems, fiscalQuarter, fiscalYear } = stagingTranscript;
    // trim down the db values to only what we need for the api
    const stagingLineItemTrimmed = stagingLineItems.map(({ rawLineItem, rawPeriod, rawLow, rawHigh, rawUnit, rawScale, metricType, rawTranscriptSourceSentence, rawTranscriptParagraph, }) => {
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
    });
    return {
        companyName,
        companyTicker,
        fiscalQuarter,
        fiscalYear,
        stagingLineItems: stagingLineItemTrimmed,
    };
};
const getStagingTranscriptsByCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const companyTicker = req.query.companyTicker;
    const transcripts = yield models_1.StagingTranscript.find({ companyTicker });
    const trnByPeriod = {};
    const idToPeriod = {};
    for (const trn of transcripts) {
        const { rawTranscriptId } = trn;
        const transId = `${rawTranscriptId}`;
        let transcriptPeriod = idToPeriod[transId];
        if (!transcriptPeriod) {
            const rawTrn = yield models_1.RawTranscript.findById(transId);
            if (!rawTrn) {
                (0, error_1.logApiError)(req, res, next, Error(`rawTrn not found ${transId}`), 500);
                continue;
            }
            idToPeriod[transId] = `${rawTrn === null || rawTrn === void 0 ? void 0 : rawTrn.fiscalYear} Q${rawTrn === null || rawTrn === void 0 ? void 0 : rawTrn.fiscalQuarter}`;
            transcriptPeriod = idToPeriod[transId];
        }
        if (!trnByPeriod[transcriptPeriod])
            trnByPeriod[transcriptPeriod] = [];
        trnByPeriod[transcriptPeriod].push(Object.assign({ period: transcriptPeriod }, stagingTranscriptDBToAPIMap(trn)));
    }
    // writeTranscriptsToCsv(trnByPeriod, companyTicker)
    return res.send({ transcriptsByPeriod: trnByPeriod });
});
exports.getStagingTranscriptsByCompany = getStagingTranscriptsByCompany;
//# sourceMappingURL=stagingTranscript.js.map