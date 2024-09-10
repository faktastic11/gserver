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
exports.getRawTranscripts = void 0;
const models_1 = require("models");
const getRawTranscripts = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyTicker, transcriptYear, transcriptQuarter } = req.query;
    console.log(Object.assign(Object.assign(Object.assign({}, (companyTicker && { companyTicker })), (transcriptYear && { fiscalYear: transcriptYear })), (transcriptQuarter && { fiscalQuarter: transcriptQuarter })));
    const transcripts = yield models_1.RawTranscript.find(Object.assign(Object.assign(Object.assign({}, (companyTicker && { companyTicker })), (transcriptYear && { fiscalYear: transcriptYear })), (transcriptQuarter && { fiscalQuarter: transcriptQuarter })));
    return res.send({ transcripts });
});
exports.getRawTranscripts = getRawTranscripts;
//# sourceMappingURL=rawTranscripts.js.map