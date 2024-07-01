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
const error_1 = require("../controllers/error");
const processTranscript_1 = require("../controllers/processTranscript");
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const models_1 = require("../models");
const loggers_1 = require("../util/loggers");
const validators_1 = __importStar(require("../validators"));
const logger = (0, loggers_1.getRegLogger)(__filename);
const router = express_1.default.Router();
const processTranscriptsValidation = (req, res, next) => {
    const bodySchema = joi_1.default.object({
        companyTicker: joi_1.default.string(),
        transcriptYear: joi_1.default.number(),
        transcriptQuarter: joi_1.default.number(),
    });
    (0, validators_1.default)(req, res, next, [{ schema: bodySchema, reqTarget: validators_1.reqTargetTypes.BODY }]);
};
router.post('/v1/processTranscripts', processTranscriptsValidation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyTicker, transcriptYear, transcriptQuarter } = req.body;
    try {
        const rawTranscript = yield models_1.RawTranscript.findOne({ companyTicker, transcriptYear, transcriptQuarter });
        if (!rawTranscript)
            throw Error(`RawTranscript not found for parameters`);
        const processedTranscripts = yield (0, processTranscript_1.initTranscriptProcessing)(rawTranscript.id);
        return res.status(200).send();
    }
    catch (err) {
        return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not process transcripts');
    }
}));
exports.default = router;
//# sourceMappingURL=processTranscripts.js.map