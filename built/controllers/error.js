"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericExpressErrorHandler = exports.logServerError = exports.logApiError = void 0;
const util_1 = __importDefault(require("../util"));
class ApiError extends Error {
    constructor(err, additionalInfo, statusCode, apiPath, body, query, params) {
        super(err);
        this.systemMessage = err.message;
        this.additionalInfo = additionalInfo;
        this.apiPath = apiPath;
        this.statusCode = statusCode;
        this.stack = err.stack || null;
        this.body = body;
        this.query = query;
        this.params = params;
    }
}
const logApiError = (req, res, next, err, statusCode = 500, additionalInfo = '') => {
    const path = req.originalUrl;
    console.error(err);
    next(new ApiError(err, additionalInfo, statusCode, path, req.body, req.query, req.params));
};
exports.logApiError = logApiError;
const logServerError = (customMessage, err, throwE = false) => {
    console.log('\n', customMessage);
    console.error(err.message);
    console.error(err.stack);
    console.log('\n');
    if (throwE)
        throw `${customMessage}-${err.message}`;
};
exports.logServerError = logServerError;
const genericExpressErrorHandler = (err, req, res, next) => {
    const { statusCode = 500 } = err;
    console.error('\n');
    console.error(`Error at Route: ${err.apiPath}`);
    console.error(`Custom Message: ${util_1.default.inspect(err.additionalInfo, true, 4, true)}`);
    console.error(`System Message: ${err.systemMessage}`);
    if (Object.keys(err.params).length)
        console.error(`Params: ${util_1.default.inspect(err.params, true, 4, true)}`);
    if (Object.keys(err.query).length)
        console.error(`Query: ${util_1.default.inspect(err.query, true, 4, true)}`);
    if (Object.keys(err.body).length)
        console.error(`Body: ${util_1.default.inspect(err.body, true, 4, true)}`);
    // console.error(`Stack Message: ${err.stack}`);
    delete err.statusCode;
    delete err.stack;
    return res.status(statusCode).json({ Error: err });
};
exports.genericExpressErrorHandler = genericExpressErrorHandler;
//# sourceMappingURL=error.js.map