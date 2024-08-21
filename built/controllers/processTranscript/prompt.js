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
exports.ChatGPTSession = exports.OpenAICompletion = exports.GPTPrompt = void 0;
const crypto_1 = require("crypto");
const openai_1 = require("services/openai");
const loggers_1 = require("util/loggers");
const openai_2 = require("../../services/openai");
/* eslint-disable @typescript-eslint/no-explicit-any */
const logger = (0, loggers_1.getRegLogger)(__filename);
class GPTPrompt {
    constructor({ role, content, metaData, temp, presencePenalty, responseType, nextPromptKey, _response, promptName, }) {
        this.formatString = ({ string, replacements }) => {
            return string.replace(/\{([^}]+)\}/g, (match, key) => {
                // eslint-disable-next-line no-prototype-builtins
                return replacements.hasOwnProperty(key) ? replacements[key] : match;
            });
        };
        this.role = role;
        this.content = content;
        this.metaData = metaData;
        this.temp = temp !== undefined ? temp : this.temp;
        this.presencePenalty = presencePenalty !== undefined ? presencePenalty : this.presencePenalty;
        this.responseType = responseType !== undefined ? responseType : this.responseType;
        this.nextPromptKey = nextPromptKey !== undefined ? nextPromptKey : this.nextPromptKey;
        this._response = _response !== undefined ? _response : this._response;
        this.promptName = promptName || 'dunnom8';
        this.postInit({ promptName: null, content: content, contentData: this.metaData });
    }
    postInit(_a) {
        return __awaiter(this, arguments, void 0, function* ({ promptName, content, contentData }) {
            this.promptName = promptName || 'dunnom8';
            this.content = this.formatString({ string: content, replacements: contentData });
        });
    }
    promptDict() {
        return { role: this.role, content: this.content };
    }
}
exports.GPTPrompt = GPTPrompt;
class OpenAICompletion {
    constructor({ sessionId, prompts, chatCompletionResponse }) {
        var _a, _b;
        this.sessionId = sessionId;
        this.prompts = prompts;
        this.chatCompletionResponse = chatCompletionResponse;
        this.chatId = this.chatCompletionResponse.id;
        this.created = this.chatCompletionResponse.created;
        this.model = this.chatCompletionResponse.model;
        const { message: resMessage, finish_reason } = this.chatCompletionResponse.choices[0];
        this.role = resMessage.role;
        this.content = resMessage.content;
        this.functionName = (_a = resMessage.function_call) === null || _a === void 0 ? void 0 : _a.name;
        this.functionArgs = (_b = resMessage.function_call) === null || _b === void 0 ? void 0 : _b.arguments;
        this.finishReason = finish_reason;
        const { prompt_tokens, completion_tokens, total_tokens } = chatCompletionResponse.usage;
        this.promptTokens = prompt_tokens;
        this.completionTokens = completion_tokens;
        this.totalTokens = total_tokens;
        try {
            this.cost =
                this.promptTokens * openai_1.perTokenCost[this.model].input + this.completionTokens * openai_1.perTokenCost[this.model].output;
        }
        catch (err) {
            this.cost = 0;
        }
    }
}
exports.OpenAICompletion = OpenAICompletion;
class ChatGPTSession {
    constructor({ model, terminationKey, baseContext, }) {
        this.openAIGPTAPICall = (_a) => __awaiter(this, [_a], void 0, function* ({ prompt, model = this.defaultModel, availableFunctions = undefined, functionCall = 'auto', }) {
            // TODO: retry delays possible?
            const completionResponse = yield this.openai.createChatCompletion({
                model,
                messages: [prompt.promptDict()],
                temperature: prompt.temp,
                presencePenalty: prompt.presencePenalty,
            });
            const response = new OpenAICompletion(Object.assign(Object.assign({ sessionId: this.sessionId, prompts: prompt, chatCompletionResponse: completionResponse }, (availableFunctions && { availableFunctions })), (availableFunctions && { functionCall })));
            prompt._response = response.content;
            this.pastPrompts.push(prompt);
            return [this.processResponse(prompt, response), response];
        });
        this.getEmbeddings = (_b) => __awaiter(this, [_b], void 0, function* ({ text }) {
            return yield this.openai.getEmbeddings({ text });
        });
        this.defaultModel = model;
        this.terminationKey = terminationKey;
        this.baseContext = baseContext || [];
        this.pastPrompts = [];
        this.sessionId = (0, crypto_1.randomUUID)();
        this.currentPrompt = null;
        this.openai = new openai_2.OpenAiApiHelper({ maxRetries: 5, timeout: 100000 });
    }
    processResponse(prompt, response) {
        logger.debug(response.content);
        if (response.content === this.terminationKey)
            return null;
        try {
            if (prompt.responseType === 'str') {
                return response.content;
            }
            else if (prompt.responseType === 'json_object') {
                try {
                    const regex = /\[\s*(.*?)\s*\]/s;
                    const matches = response.content.match(regex);
                    if (matches.length > 0) {
                        try {
                            // Parse the extracted string into a JSON object
                            return JSON.parse(`[${matches[1]}]`);
                        }
                        catch (error) {
                            console.error('Error parsing JSON: ', error);
                        }
                    }
                    else {
                        console.log('No match found');
                    }
                }
                catch (err) {
                    logger.error('Could no parse JSON at all \n content: ', response.content);
                }
            }
            else if (prompt.responseType === 'table') {
                const rows = response.content.split('\n');
                const formatted = rows.map((row) => {
                    const fields = row.split('|');
                    let i;
                    if (fields[0] == '') {
                        i = 1;
                    }
                    else {
                        i = 0;
                    }
                    const rawLineItem = fields[i];
                    const rawPeriod = fields[i + 1];
                    const rawLow = fields[i + 2];
                    const rawHigh = fields[i + 3];
                    const rawUnit = fields[i + 4];
                    const rawScale = fields[i + 5];
                    const metricType = fields[i + 6];
                    const rawTranscriptSourceSentence = fields[i + 7];
                    return {
                        rawLineItem: rawLineItem,
                        rawPeriod: rawPeriod,
                        rawLow: rawLow,
                        rawHigh: rawHigh,
                        rawUnit: rawUnit,
                        rawScale: rawScale,
                        metricType: metricType,
                        rawTranscriptSourceSentence: rawTranscriptSourceSentence,
                    };
                });
                return formatted;
            }
            else if (prompt.responseType === 'list') {
                return response.content.split('|').map((line) => line.trim());
            }
            else if (prompt.responseType === 'bool') {
                return response.content.toLowerCase().includes('true');
            }
            else if (prompt.responseType === 'float') {
                return parseFloat(response.content);
            }
            else if (prompt.responseType === 'int') {
                return parseInt(response.content);
            }
            else {
                throw Error('Invalid response type');
            }
        }
        catch (err) {
            logger.error(err);
            throw Error('Could not process response');
        }
    }
}
exports.ChatGPTSession = ChatGPTSession;
//# sourceMappingURL=prompt.js.map