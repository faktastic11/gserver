"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schemaOptions = {
    collection: 'gptLogs',
    timestamps: true,
};
const GPTLogSchema = new mongoose_1.Schema({
    companyTicker: {
        type: String,
        required: false,
    },
    gptModel: {
        type: String,
        required: false,
    },
    fiscalYear: {
        type: Number,
        required: false,
    },
    fiscalQuarter: {
        type: Number,
        required: false,
    },
    durationMetrics: {
        totalDurationSeconds: {
            type: Number,
            required: false,
            default: function () {
                if (this.durationMetrics.start && this.durationMetrics.end) {
                    return (this.durationMetrics.end.getTime() - this.durationMetrics.start.getTime()) / 1000;
                }
                else
                    return null;
            },
        },
        start: {
            type: Date,
            required: false,
        },
        end: {
            type: Date,
            required: false,
        },
    },
    rawTranscriptId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'rawTranscript', required: true },
    lineItems: [
        {
            sessionId: {
                type: String,
                required: false,
            },
            chatId: {
                type: String,
                required: false,
            },
            chatgptCreatedAt: {
                type: Date,
                required: false,
            },
            baseContext: {
                type: String,
                required: false,
            },
            prompt: {
                type: String,
                required: false,
            },
            role: {
                type: String,
                required: false,
            },
            content: {
                type: String,
                required: false,
            },
            functionName: {
                type: String,
                required: false,
            },
            functionArguments: {
                type: String,
                required: false,
            },
            finishReason: {
                type: String,
                required: false,
            },
            promptTokens: {
                type: Number,
                required: false,
            },
            completionTokens: {
                type: Number,
                required: false,
            },
            totalTokens: {
                type: Number,
                required: false,
            },
            promptCost: {
                type: Number,
                required: false,
            },
        },
    ],
}, schemaOptions);
exports.default = (0, mongoose_1.model)('GPTLog', GPTLogSchema);
//# sourceMappingURL=GPTLog.js.map