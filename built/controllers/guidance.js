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
exports.getGuidanceRevisions = exports.getGuidanceCompanies = exports.getCompanyGuidanceTranscripts = exports.getCompanyGuidancePeriods = exports.getTickerGuidance = void 0;
const models_1 = require("models");
const getTickerGuidance = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyTicker, fiscalYear, fiscalQuarter, metricType } = req.query;
    const pipeline = [
        {
            $match: Object.assign(Object.assign(Object.assign({ companyTicker: companyTicker }, (fiscalYear && { fiscalYear: Number(fiscalYear) })), (fiscalQuarter && { fiscalQuarter: fiscalQuarter })), (metricType && { "stagingLineItems.metricType": metricType })),
        },
        {
            $unwind: "$stagingLineItems",
        },
        {
            $match: Object.assign({}, (metricType && { "stagingLineItems.metricType": metricType })),
        },
        {
            $project: {
                _id: 0,
                companyTicker: 1,
                "stagingLineItems.rawPeriod": 1,
                "stagingLineItems.rawLineItem": 1,
                "stagingLineItems.rawLow": 1,
                "stagingLineItems.rawHigh": 1,
                "stagingLineItems.rawTranscriptSourceSentence": 1,
                "stagingLineItems.rawTranscriptParagraph.page_content": 1,
            },
        },
    ];
    const guidance = yield models_1.StagingTranscript.aggregate(pipeline);
    return res.send({ guidance });
});
exports.getTickerGuidance = getTickerGuidance;
const getCompanyGuidancePeriods = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyTicker } = req.params;
    const periods = (yield models_1.ProcessedTranscript.aggregate([
        { $match: { companyTicker } },
        {
            $group: {
                _id: {
                    year: "$guidancePeriod.fiscalYear",
                    quarter: "$guidancePeriod.fiscalQuarter",
                },
            },
        },
    ]))
        .map((doc) => doc._id)
        .filter(({ year, quarter }) => year || quarter);
    return res.send({ companyTicker, guidancePeriods: periods });
});
exports.getCompanyGuidancePeriods = getCompanyGuidancePeriods;
const getCompanyGuidanceTranscripts = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyTicker } = req.params;
        const [periods, company] = yield Promise.all([
            models_1.StagingTranscript.aggregate([
                { $match: { companyTicker } },
                { $group: { _id: { year: "$fiscalYear", quarter: "$fiscalQuarter" } } },
            ])
                .exec()
                .then((docs) => docs.map((doc) => doc._id))
                .then((ids) => ids.filter(({ year, quarter }) => year && quarter)),
            models_1.Company.findOne({ companyTicker }).exec(),
        ]);
        const companyName = (company === null || company === void 0 ? void 0 : company.companyName) || companyTicker;
        const { userId } = req.user;
        let userHistory = yield models_1.UserHistory.findOne({ userId }).exec();
        if (!userHistory) {
            userHistory = new models_1.UserHistory({ userId, searches: [] });
        }
        const searches = userHistory.searches.filter((item) => item !== companyTicker);
        searches.push(companyTicker);
        yield models_1.UserHistory.findOneAndUpdate({ userId }, { searches }, { upsert: true, new: true }).exec();
        return res.send({ companyTicker, companyName, transcriptPeriods: periods });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ error: "An error occurred while fetching the transcripts" });
    }
});
exports.getCompanyGuidanceTranscripts = getCompanyGuidanceTranscripts;
const getGuidanceCompanies = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    // const { limit, skip } = req.query - we don't need these for now
    const companies = yield models_1.ProcessedTranscript.distinct("companyTicker");
    return res.send({ companies: companies.filter((c) => c) });
});
exports.getGuidanceCompanies = getGuidanceCompanies;
const getGuidanceRevisions = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyTicker, fiscalYear, metricType } = req.query;
        if (!companyTicker || !fiscalYear || !metricType) {
            return res.status(400).json({
                error: "company ticker, fiscal year, and metric type are required",
            });
        }
        const data = yield models_1.GuidanceRevisions.findOne({
            companyTicker: companyTicker,
            fiscalYear: parseInt(fiscalYear, 10),
            metricType: metricType,
        });
        if (!data) {
            return res.status(404).json({ error: "Data not found" });
        }
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getGuidanceRevisions = getGuidanceRevisions;
//# sourceMappingURL=guidance.js.map