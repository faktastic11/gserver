"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schemaOptions = {
    collection: 'processedTranscripts',
    timestamps: true,
};
const valueItemSchema = {
    type: {
        amt: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            required: true,
        },
        scale: {
            type: String,
            required: false,
        },
    },
    required: false,
};
const ProcessedTranscriptSchema = new mongoose_1.Schema({
    companyName: {
        type: String,
        required: true,
        index: true,
    },
    companyTicker: {
        type: String,
        required: true,
        index: true,
    },
    lineItem: {
        type: String,
        required: true,
    },
    metricType: {
        type: String,
        required: true,
    },
    valueCategory: {
        type: String,
        required: true,
        default: 'unknown',
    },
    value: {
        low: valueItemSchema,
        mid: valueItemSchema,
        high: valueItemSchema,
        actual: valueItemSchema,
        raw: { low: String, high: String, unit: String, scale: String },
    },
    guidancePeriod: {
        fiscalYear: {
            type: Number,
            required: false,
            index: true,
        },
        fiscalQuarter: {
            type: Number,
            required: false,
            index: true,
        },
        raw: {
            type: String,
            required: false,
        },
    },
    transcriptPeriod: {
        fiscalYear: {
            type: Number,
            index: true,
        },
        fiscalQuarter: {
            type: Number,
            required: false,
            index: true,
        },
        reportDate: {
            type: Date,
            required: true,
            index: true,
        },
    },
    rawTranscriptSourceSentence: {
        type: String,
        required: true,
    },
    rawTranscriptSourceParagraph: {
        type: String,
        required: false,
    },
    transcriptPosition: {
        startLine: {
            type: Number,
            required: false,
        },
        endLine: {
            type: Number,
            required: false,
        },
    },
    rawTranscriptId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'rawTranscript', required: true },
}, schemaOptions);
ProcessedTranscriptSchema.index({ companyTicker: 1, fiscalYear: 1, fiscalQuarter: 1 });
ProcessedTranscriptSchema.index({ companyTicker: 1, fiscalYear: 1, fiscalQuarter: 1, lineItem: 1, reportDate: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)('processedTranscript', ProcessedTranscriptSchema);
//# sourceMappingURL=ProcessedTranscript.js.map