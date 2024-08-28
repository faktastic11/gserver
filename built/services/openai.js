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
exports.perTokenCost = exports.OpenAiApiHelper = void 0;
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const openai_1 = __importDefault(require("openai"));
const envVariables_1 = require("../config/envVariables");
class OpenAiApiHelper {
    constructor({ maxRetries, timeout }) {
        this.getEmbeddings = ({ text, model = 'text-embedding-ada-002' }) => __awaiter(this, void 0, void 0, function* () {
            text = text.replace('\n', ' ');
            const returnPromise = this.openai.embeddings.create({ input: text, model: model });
            const embeddings = yield returnPromise;
            return embeddings.data[0].embedding;
        });
        dotenv.config({ path: `${process.cwd()}/.env` });
        this.org = envVariables_1.openaiOrganizationId;
        this.openai = new openai_1.default({
            apiKey: envVariables_1.openaiApiKey,
            organization: this.org,
            maxRetries,
            timeout,
        });
    }
    createChatCompletion({ messages, model, temperature = undefined, presencePenalty = undefined, functions = undefined, functionCall = undefined, timeout = undefined, retries = 0, }) {
        return this.openai.chat.completions.create(Object.assign(Object.assign(Object.assign(Object.assign({ messages,
            model }, (functions && { functions })), (functionCall && { name: functionCall })), (temperature && { temperature })), (presencePenalty && { presencePenalty })), Object.assign(Object.assign({}, (timeout && { timeout })), { retries }));
    }
    finetuneModel(path, purpose = 'fine-tune') {
        const fileUpload = this.openai.files.create({ file: fs_1.default.createReadStream(path), purpose: purpose });
        const fineTune = this.openai.fineTuning.jobs.create({ training_file: fileUpload, model: 'gpt-3.5-turbo' });
        return fineTune;
    }
}
exports.OpenAiApiHelper = OpenAiApiHelper;
exports.perTokenCost = {
    'gpt-4-preview-1106': {
        input: 0.00001,
        output: 0.00003,
    },
    'gpt-4': {
        input: 0.00003,
        output: 0.00006,
    },
    'gpt-4-0613': {
        input: 0.00003,
        output: 0.00006,
    },
    'gpt-4-32k': {
        input: 0.00006,
        output: 0.00012,
    },
    'gpt-3.5-turbo': {
        input: 0.0000015,
        output: 0.000002,
    },
    'gpt-3.5-turbo-0613': {
        input: 0.0000015,
        output: 0.000002,
    },
    'gpt-3.5-turbo-16k': {
        input: 0.000003,
        output: 0.000004,
    },
};
//# sourceMappingURL=openai.js.map