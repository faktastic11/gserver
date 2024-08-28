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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../controllers/error");
const rawTranscripts_1 = require("../controllers/rawTranscripts");
const stagingTranscript_1 = require("../controllers/stagingTranscript");
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const validators_1 = __importStar(require("../validators"));
const router = express_1.default.Router();
const transcriptsValidation = (req, res, next) => {
    const querySchema = joi_1.default.object({
        companyTicker: joi_1.default.string(),
        transcriptYear: joi_1.default.number(),
        transcriptQuarter: joi_1.default.number(),
        limit: joi_1.default.number().min(0).default(400),
        skip: joi_1.default.number().min(0).default(0),
    });
    (0, validators_1.default)(req, res, next, [{ schema: querySchema, reqTarget: validators_1.reqTargetTypes.QUERY }]);
};
router.get('/v1/raw/transcripts', transcriptsValidation, (req, res, next) => (0, rawTranscripts_1.getRawTranscripts)(req, res, next).catch((err) => {
    return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not get company guidance transcript segments or they do not exist');
}));
const stagingTranscriptsListValidation = (req, res, next) => {
    const querySchema = joi_1.default.object({
        companyTicker: joi_1.default.string(),
        outputToCSV: joi_1.default.boolean().default(false),
    });
    (0, validators_1.default)(req, res, next, [{ schema: querySchema, reqTarget: validators_1.reqTargetTypes.QUERY }]);
};
// router.get('/v1/staging/transcripts', stagingTranscriptsListValidation, (req, res, next) =>
//   getAllStagingTranscriptPeriods(req, res, next).catch((err) => {
//     return logApiError(req, res, next, err, 500, 'Could not get staging transcripts list')
//   }),
// )
const stagingTranscriptsValidation = (req, res, next) => {
    const querySchema = joi_1.default.object({
        companyTicker: joi_1.default.string(),
        outputToCSV: joi_1.default.boolean().default(false),
    });
    (0, validators_1.default)(req, res, next, [{ schema: querySchema, reqTarget: validators_1.reqTargetTypes.QUERY }]);
};
router.get('/v1/staging/transcript', stagingTranscriptsValidation, (req, res, next) => (0, stagingTranscript_1.getStagingTranscriptsByCompany)(req, res, next).catch((err) => {
    return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not get company staging transcripts or they do not exist');
}));
exports.default = router;
//# sourceMappingURL=transcripts.js.map