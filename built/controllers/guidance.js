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
exports.getGuidanceCompanies = exports.getCompanyGuidanceTranscripts = exports.getCompanyGuidancePeriods = exports.getTickerGuidance = void 0;
const models_1 = require("../models");
const getTickerGuidance = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyTicker, transcriptYear, transcriptQuarter, guidanceYear, guidanceQuarter } = req.query;
    const guidance = yield models_1.ProcessedTranscript.find(Object.assign(Object.assign(Object.assign(Object.assign({ companyTicker }, (transcriptYear && { 'transcriptPeriod.fiscalYear': transcriptYear })), (transcriptQuarter && { 'transcriptPeriod.fiscalQuarter': transcriptQuarter })), (guidanceYear && { 'guidancePeriod.fiscalYear': guidanceYear })), (guidanceQuarter && { 'guidancePeriod.fiscalQuarter': guidanceQuarter })));
    return res.send({ guidance });
});
exports.getTickerGuidance = getTickerGuidance;
const getCompanyGuidancePeriods = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyTicker } = req.params;
    const periods = (yield models_1.ProcessedTranscript.aggregate([
        { $match: { companyTicker } },
        { $group: { _id: { year: '$guidancePeriod.fiscalYear', quarter: '$guidancePeriod.fiscalQuarter' } } },
    ]))
        .map((doc) => doc._id)
        .filter(({ year, quarter }) => year || quarter);
    return res.send({ companyTicker, guidancePeriods: periods });
});
exports.getCompanyGuidancePeriods = getCompanyGuidancePeriods;
const getCompanyGuidanceTranscripts = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyTicker } = req.params;
    const periods = (yield models_1.ProcessedTranscript.aggregate([
        { $match: { companyTicker } },
        { $group: { _id: { year: '$transcriptPeriod.fiscalYear', quarter: '$transcriptPeriod.fiscalQuarter' } } },
    ]))
        .map((doc) => doc._id)
        .filter(({ year, quarter }) => year && quarter);
    return res.send({ companyTicker, transcriptPeriods: periods });
});
exports.getCompanyGuidanceTranscripts = getCompanyGuidanceTranscripts;
const getGuidanceCompanies = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    // const { limit, skip } = req.query - we don't need these for now
    const companies = yield models_1.ProcessedTranscript.distinct('companyTicker');
    return res.send({ companies: companies.filter((c) => c) });
});
exports.getGuidanceCompanies = getGuidanceCompanies;
//# sourceMappingURL=guidance.js.map