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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTranscriptProcessing = void 0;
const models_1 = require("../../models");
const processRawTranscriptToStaging_1 = __importDefault(require("./processRawTranscriptToStaging"));
const processStagingTranscriptToProcessed_1 = __importDefault(require("./processStagingTranscriptToProcessed"));
const loggers_1 = require("util/loggers");
const logger = (0, loggers_1.getRegLogger)('initTranscriptProcessing');
// function to process the entire pipeline for a transcript
const initTranscriptProcessing = (RawTranscriptId) => __awaiter(void 0, void 0, void 0, function* () {
    const transcript = yield models_1.RawTranscript.findOne({ _id: RawTranscriptId });
    if (!transcript)
        throw Error(`Transcript not found for id ${RawTranscriptId}`);
    logger.info(`Processing transcript ${transcript._id}`);
    // call pipeline function from raw --> staging transcript
    const stagingTranscriptId = yield (0, processRawTranscriptToStaging_1.default)(RawTranscriptId);
    // call pipeline function from staging --> process transcript
    const processedTranscriptIds = yield (0, processStagingTranscriptToProcessed_1.default)(stagingTranscriptId);
    logger.info(`Finished Processing transcript ${transcript._id}`);
    return processedTranscriptIds;
});
exports.initTranscriptProcessing = initTranscriptProcessing;
//# sourceMappingURL=index.js.map