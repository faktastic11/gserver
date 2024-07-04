"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMongoURI = exports.openaiOrganizationId = exports.openaiApiKey = exports.port = exports.nodeEnv = void 0;
exports.nodeEnv = process.env.NODE_ENV;
if (exports.nodeEnv === 'local')
    console.log(process.env);
exports.port = process.env.PORT || 5001;
exports.openaiApiKey = process.env.OPENAI_API_KEY;
exports.openaiOrganizationId = process.env.OPENAI_ORGANIZATION;
const makeMongoURI = (dbName) => {
    return process.env.MONGO_URI.replace('<db_name>', dbName);
};
exports.makeMongoURI = makeMongoURI;
//# sourceMappingURL=envVariables.js.map