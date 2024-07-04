"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schemaOptions = {
    collection: 'companies',
    timestamps: true,
};
const CompanySchema = new mongoose_1.Schema({
    companyName: {
        type: String,
        required: true,
        index: true,
    },
    companyTicker: {
        type: String,
        required: true,
        index: true,
    },
    gics: {
        sector: { type: String, required: false },
        subIndustry: { type: String, required: false },
    },
    description: {
        type: String,
        required: false,
    },
}, schemaOptions);
exports.default = (0, mongoose_1.model)('Company', CompanySchema);
//# sourceMappingURL=Company.js.map