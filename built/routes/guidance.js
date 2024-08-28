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
const guidance_1 = require("../controllers/guidance");
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const auth_1 = require("../middleware/auth");
const validators_1 = __importStar(require("../validators"));
const router = express_1.default.Router();
const tickerGuidanceValidation = (req, res, next) => {
    const querySchema = joi_1.default.object({
        companyTicker: joi_1.default.string(),
        transcriptYear: joi_1.default.number(),
        transcriptQuarter: joi_1.default.number(),
        guidanceYear: joi_1.default.number(),
        guidanceQuarter: joi_1.default.number(),
        limit: joi_1.default.number().min(0).default(400),
        skip: joi_1.default.number().min(0).default(0),
    });
    (0, validators_1.default)(req, res, next, [{ schema: querySchema, reqTarget: validators_1.reqTargetTypes.QUERY }]);
};
router.get('/v1/guidance', auth_1.authenticateToken, tickerGuidanceValidation, (req, res, next) => (0, guidance_1.getTickerGuidance)(req, res, next).catch((err) => {
    console.error(err);
    return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not get company guidance or it does not exist');
}));
const guidancePeriodsValidation = (req, res, next) => {
    const paramSchema = joi_1.default.object({
        companyTicker: joi_1.default.string().required(),
    });
    const querySchema = joi_1.default.object({
        limit: joi_1.default.number().min(0).default(400),
        skip: joi_1.default.number().min(0).default(0),
    });
    (0, validators_1.default)(req, res, next, [
        { schema: querySchema, reqTarget: validators_1.reqTargetTypes.QUERY },
        { schema: paramSchema, reqTarget: validators_1.reqTargetTypes.PARAMS },
    ]);
};
router.get('/v1/guidance/periods/:companyTicker', auth_1.authenticateToken, guidancePeriodsValidation, (req, res, next) => (0, guidance_1.getCompanyGuidancePeriods)(req, res, next).catch((err) => {
    return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not get company guidance segments or they do not exist');
}));
const guidanceTranscriptsValidation = (req, res, next) => {
    const paramSchema = joi_1.default.object({
        companyTicker: joi_1.default.string().required(),
    });
    const querySchema = joi_1.default.object({
        limit: joi_1.default.number().min(0).default(400),
        skip: joi_1.default.number().min(0).default(0),
    });
    (0, validators_1.default)(req, res, next, [
        { schema: querySchema, reqTarget: validators_1.reqTargetTypes.QUERY },
        { schema: paramSchema, reqTarget: validators_1.reqTargetTypes.PARAMS },
    ]);
};
router.get('/v1/guidance/transcripts/:companyTicker', auth_1.authenticateToken, guidanceTranscriptsValidation, (req, res, next) => (0, guidance_1.getCompanyGuidanceTranscripts)(req, res, next).catch((err) => {
    return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not get company guidance transcript segments or they do not exist');
}));
const guidanceCompaniesValidation = (req, res, next) => {
    const schema = joi_1.default.object({
        limit: joi_1.default.number().min(0).default(500),
        skip: joi_1.default.number().min(0).default(0),
    });
    (0, validators_1.default)(req, res, next, [{ schema: schema, reqTarget: validators_1.reqTargetTypes.QUERY }]);
};
router.get('/v1/guidance/companies', auth_1.authenticateToken, guidanceCompaniesValidation, (req, res, next) => {
    (0, guidance_1.getGuidanceCompanies)(req, res, next).catch((err) => {
        return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not get guidance for companies');
    });
});
exports.default = router;
//# sourceMappingURL=guidance.js.map