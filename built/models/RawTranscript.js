"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schemaOptions = {
    collection: 'rawTranscripts',
    timestamps: true,
};
const RawTranscriptSchema = new mongoose_1.Schema({
    companyName: {
        type: String,
        required: true,
    },
    companyTicker: {
        type: String,
        required: true,
    },
    dateOfRecord: {
        type: Date,
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
    transcript: [
        {
            text: {
                type: String,
                required: true,
            },
            processFurther: {
                type: Boolean,
                required: false,
                default: null,
            },
        },
    ],
}, schemaOptions);
RawTranscriptSchema.index({ companyTicker: 1, fiscalYear: 1, fiscalQuarter: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)('rawTranscript', RawTranscriptSchema);
//# sourceMappingURL=RawTranscript.js.map