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
const models_1 = require("models");
const loggers_1 = require("util/loggers");
const logger = (0, loggers_1.getRegLogger)(__filename);
// returns the processed transcript ids as a string
const convertValues = (stagingLineItem) => {
    const { rawLow, rawHigh, rawUnit, rawScale } = stagingLineItem;
    let scale = rawScale;
    let unit = rawUnit;
    let amtLow = 0;
    let amtHigh = null;
    if (rawScale.includes("million")) {
        scale = "million";
        unit = rawUnit;
        amtLow = Number(rawLow) * 1000000;
        if (rawHigh)
            amtHigh = Number(rawHigh) * 1000000;
    }
    else if (rawScale.includes("billion")) {
        scale = "billion";
        unit = rawUnit;
        amtLow = Number(rawLow) * 1000000000;
        if (rawHigh)
            amtHigh = Number(rawHigh) * 1000000000;
    }
    else if (rawScale.includes("trillion")) {
        // do we need this, probably not
        scale = "trillion";
        unit = rawUnit;
        amtLow = Number(rawLow) * 1000000000000;
        if (rawHigh)
            amtHigh = Number(rawHigh) * 1000000000000;
    }
    else if (rawScale.includes("percent") || rawScale.includes("%")) {
        scale = "percent";
        unit = "%";
        amtLow = Number(rawLow);
        if (rawHigh)
            amtHigh = Number(rawHigh) / 100;
    }
    else {
        logger.warn(`Unknown scale: ${rawScale}, low: ${rawLow}, high: ${rawHigh}, unit: ${rawUnit}}}`);
    }
    return { scale, unit, amtLow, amtHigh };
};
function processStagingTranscriptToProcessed(stagingTranscriptId) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Processing staging transcript ids: ${stagingTranscriptId} to processed transcript`);
        const stagingTranscript = yield models_1.StagingTranscript.findById(stagingTranscriptId);
        if (!stagingTranscript) {
            logger.warn("no staging transcript found for processing");
            return [];
        }
        const createdProcessedTranscripts = [];
        const { companyName, companyTicker, rawTranscriptId, stagingLineItems } = stagingTranscript;
        const rawT = yield models_1.RawTranscript.findOne({ _id: rawTranscriptId });
        if (!rawT)
            throw Error(`RawTranscript not found for id ${rawTranscriptId}`);
        const { fiscalQuarter, fiscalYear, dateOfRecord } = rawT;
        for (const st of stagingLineItems) {
            const { rawLineItem, rawPeriod, rawHigh, metricType, rawTranscriptSourceSentence, transcriptPosition, } = st;
            const { scale, unit, amtLow, amtHigh } = convertValues(st);
            try {
                const pT = yield models_1.ProcessedTranscript.create({
                    companyName,
                    companyTicker,
                    lineItem: rawLineItem,
                    metricType,
                    valueCategory: "unknown",
                    guidancePeriod: {
                        raw: rawPeriod,
                    },
                    transcriptPeriod: {
                        fiscalYear,
                        fiscalQuarter,
                        reportDate: dateOfRecord,
                    },
                    value: {
                        low: { amt: amtLow, unit, scale },
                        high: rawHigh ? { amt: amtHigh, unit } : undefined,
                        mid: Number(amtLow) && Number(amtHigh)
                            ? { amt: (Number(amtLow) + Number(amtHigh)) / 2, unit, scale }
                            : undefined,
                    },
                    rawTranscriptSourceSentence,
                    transcriptPosition,
                    rawTranscriptId,
                });
                createdProcessedTranscripts.push(pT._id);
            }
            catch (err) {
                logger.error(err);
            }
        }
        return createdProcessedTranscripts;
    });
}
exports.default = processStagingTranscriptToProcessed;
//# sourceMappingURL=processStagingTranscriptToProcessed.js.map