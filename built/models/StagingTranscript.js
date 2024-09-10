"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagingTranscriptProcessingStage = void 0;
const mongoose_1 = require("mongoose");
var StagingTranscriptProcessingStage;
(function (StagingTranscriptProcessingStage) {
    StagingTranscriptProcessingStage["PROCESSING"] = "processing";
    StagingTranscriptProcessingStage["POST_PROCESSING"] = "post processing";
    StagingTranscriptProcessingStage["DONE"] = "done";
    StagingTranscriptProcessingStage["ERROR"] = "error";
})(StagingTranscriptProcessingStage || (exports.StagingTranscriptProcessingStage = StagingTranscriptProcessingStage = {}));
const schemaOptions = {
    collection: "stagingTranscripts",
    timestamps: true,
};
const StagingTranscriptSchema = new mongoose_1.Schema({
    companyName: {
        type: String,
    },
    companyTicker: {
        type: String,
        required: true,
        index: true,
    },
    rawTranscriptId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "rawTranscript",
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
    },
    fiscalYear: {
        type: Number,
        required: true,
    },
    fiscalQuarter: {
        type: Number,
        required: true,
    },
    processingStage: {
        type: String,
        default: StagingTranscriptProcessingStage.PROCESSING,
        enum: Object.values(StagingTranscriptProcessingStage),
    },
    stagingLineItems: [
        {
            rawLineItem: {
                type: String,
                required: false,
            },
            rawPeriod: {
                type: String,
                required: false,
            },
            rawLow: {
                type: String,
                required: false,
            },
            rawHigh: {
                type: String,
            },
            rawUnit: {
                type: String,
            },
            rawScale: {
                type: String,
            },
            metricType: {
                type: String,
                required: false,
            },
            rawTranscriptParagraph: {
                type: String,
                required: false,
            },
            rawTranscriptSourceSentence: {
                type: String,
                required: false,
            },
            transcriptPosition: {
                type: mongoose_1.Schema.Types.Mixed,
            },
            rawLineItemEmbedding: {
                type: [Number],
                required: false,
            },
        },
    ],
}, schemaOptions);
StagingTranscriptSchema.index({ companyTicker: 1 });
StagingTranscriptSchema.index({
    companyTicker: 1,
    fiscalYear: 1,
    fiscalQuarter: 1,
});
StagingTranscriptSchema.index({ createdAt: -1 });
StagingTranscriptSchema.index({ updatedAt: -1 });
StagingTranscriptSchema.index({ processingStage: -1 });
StagingTranscriptSchema.index({ rawTranscriptId: -1 });
exports.default = (0, mongoose_1.model)("stagingTranscript", StagingTranscriptSchema);
//# sourceMappingURL=StagingTranscript.js.map