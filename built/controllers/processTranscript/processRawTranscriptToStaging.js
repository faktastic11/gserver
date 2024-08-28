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
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPrompt = void 0;
const fs = __importStar(require("fs"));
const text_splitter_1 = require("langchain/text_splitter");
const models_1 = require("../../models");
const loggers_1 = require("../../util/loggers");
const models_2 = require("../../models");
const prompt_1 = require("./prompt");
const logger = (0, loggers_1.getRegLogger)(__filename);
function readPrompt(promptPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rawData = yield fs.promises.readFile(promptPath, 'utf-8');
            const prompt = JSON.parse(rawData);
            return prompt;
        }
        catch (error) {
            logger.error('Error reading the file:', error);
        }
    });
}
exports.readPrompt = readPrompt;
const binaryClassification = (companyName, transcriptDocuments) => __awaiter(void 0, void 0, void 0, function* () {
    const classifierJSON = yield readPrompt('prompts/guidance_prompt.json');
    const classifierContext = classifierJSON['classifier_context'];
    // Classifier for further processing
    const classifyChat = new prompt_1.ChatGPTSession({
        model: 'gpt-3.5-turbo',
        terminationKey: 'TERMINATE',
    });
    const furtherProcessingDocs = (yield Promise.all(transcriptDocuments.map((doc) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            if (((_a = doc === null || doc === void 0 ? void 0 : doc.pageContent) === null || _a === void 0 ? void 0 : _a.length) < 20) {
                return null;
            }
            const classifierPrompt = new prompt_1.GPTPrompt({
                role: 'user',
                content: classifierContext.content,
                metaData: {
                    companyName,
                    transcriptParagraph: doc.pageContent,
                },
                responseType: 'bool',
                temp: 0,
            });
            const classifierResult = yield classifyChat.openAIGPTAPICall({
                prompt: classifierPrompt,
            });
            if (classifierResult) {
                console.info('Found financial info in doc %o', (_c = (_b = doc.metadata) === null || _b === void 0 ? void 0 : _b.loc) === null || _c === void 0 ? void 0 : _c.lines);
                return doc;
            }
            return null;
        }
        catch (err) {
            logger.error(`Error classifying line ${err}`);
            return null;
        }
    })))).filter((doc) => doc != null);
    return furtherProcessingDocs;
});
function processRawTranscriptToStaging(rawTranscriptId, useBinaryClassifier = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawTranscript = yield models_1.RawTranscript.findOne({ _id: rawTranscriptId });
        if (!rawTranscript)
            throw new Error(`Raw transcript ${rawTranscriptId} not found`);
        const { fiscalYear, fiscalQuarter, companyName, companyTicker } = rawTranscript;
        logger.info(`Start processing raw transcript ${rawTranscriptId} to staging transcript line items`);
        const processingStartTime = new Date();
        // binaryClassification(transcript, false)
        // join the text attribute of each object in transcript array into a single string
        const transcriptText = rawTranscript['transcript'].map((item) => item.text).join('\n');
        const text = transcriptText;
        const splitter = new text_splitter_1.CharacterTextSplitter({
            separator: '\n',
            chunkSize: 1000,
            chunkOverlap: 300,
        });
        let transcriptDocuments = yield splitter.createDocuments([text]);
        if (useBinaryClassifier) {
            transcriptDocuments = yield binaryClassification(companyName, transcriptDocuments);
        }
        // read prompts/oneshot_prompt.json and store in variable
        const extractionJSON = yield readPrompt('prompts/extraction_prompt.json');
        const extractJSON = extractionJSON['extract_line_items'];
        // create a new LLMChain object
        const extractChat = new prompt_1.ChatGPTSession({
            model: 'gpt-4-1106-preview',
            terminationKey: 'TERMINATE',
        });
        // loop through transcript documents and generate guidance for each
        const stagingTranscript = yield models_2.StagingTranscript.create({
            companyName,
            companyTicker,
            fiscalQuarter,
            fiscalYear,
            rawTranscriptId,
            sessionId: extractChat.sessionId,
            stagingLineItems: [],
        });
        const stagingTranscriptId = stagingTranscript._id;
        const stagingLineItems = [];
        const gptLog = {
            companyTicker,
            fiscalYear,
            fiscalQuarter,
            gptModel: extractChat.defaultModel,
            rawTranscriptId,
            durationMetrics: {},
            lineItems: [],
        };
        // we can probably also async this with a limit with - https://caolan.github.io/async/v3/docs.html#parallel
        // or - https://dev.to/woovi/processing-promises-in-batch-2le6
        for (const doc of transcriptDocuments) {
            try {
                const extractPrompt = new prompt_1.GPTPrompt({
                    role: 'user',
                    content: extractJSON['content'],
                    metaData: {
                        companyName: rawTranscript.companyName,
                        thisQuarter: 'Q' + rawTranscript.fiscalQuarter,
                        thisYear: rawTranscript.fiscalYear,
                        nextQuarter: 'Q' + (rawTranscript.fiscalQuarter + 1),
                        nextYear: rawTranscript.fiscalYear + 1,
                        excerpt: doc['pageContent'],
                    },
                    responseType: extractJSON['response_type'],
                    temp: 0,
                });
                const [rawResult, response] = yield extractChat.openAIGPTAPICall({ prompt: extractPrompt });
                if (rawResult != null) {
                    for (const row of rawResult) {
                        logger.debug(JSON.stringify(row));
                        const lineItemEmbedding = yield extractChat.getEmbeddings({ text: row['rawLineItem'] });
                        // Create a staging line item doc
                        const stagingLineItem = {
                            rawLineItem: row['rawLineItem'],
                            rawPeriod: row['rawPeriod'],
                            rawLow: row['rawLow'],
                            rawHigh: row['rawHigh'],
                            rawUnit: row['rawUnit'],
                            rawScale: row['rawScale'],
                            metricType: row['metricType'],
                            rawTranscriptParagraph: doc['pageContent'],
                            rawTranscriptSourceSentence: row['rawTranscriptSourceSentence'],
                            transcriptPosition: doc['metadata']['loc']['lines'],
                            rawLineItemEmbedding: lineItemEmbedding,
                        };
                        stagingLineItems.push(stagingLineItem);
                    }
                }
                else {
                    logger.debug('No line items found: ', rawResult);
                }
                const { sessionId, prompts, chatId, created, role, content, functionName, functionArgs, finishReason, promptTokens, completionTokens, totalTokens, cost, } = response;
                gptLog.lineItems.push({
                    sessionId,
                    chatId,
                    chatgptCreatedAt: new Date(created * 1000),
                    baseContext: prompts.content,
                    prompt: extractJSON.content,
                    role,
                    content,
                    functionName,
                    functionArguments: functionArgs,
                    finishReason,
                    promptTokens,
                    completionTokens,
                    totalTokens,
                    promptCost: cost,
                });
            }
            catch (err) {
                logger.error(err);
            }
        }
        const processingEndTime = new Date();
        yield models_2.StagingTranscript.findByIdAndUpdate(stagingTranscriptId, {
            processingStage: models_1.StagingTranscriptProcessingStage.DONE,
            stagingLineItems: stagingLineItems,
        });
        gptLog.durationMetrics = {
            start: processingStartTime,
            end: processingEndTime,
        };
        yield models_2.GPTLog.create(gptLog);
        logger.info(`Finish processing raw transcript ${rawTranscriptId} to staging transcript line item ${stagingTranscriptId}`);
        return stagingTranscriptId;
    });
}
exports.default = processRawTranscriptToStaging;
function testProcessingTranscripts() {
    return __awaiter(this, void 0, void 0, function* () {
        const tickers = ['NVDA'];
        for (const ticker of tickers) {
            const rawTranscripts = yield models_1.RawTranscript.findOne({ companyTicker: ticker });
            logger.info('Starting Ticker: ', ticker);
            const test = yield processRawTranscriptToStaging(rawTranscripts._id);
            logger.info('Processed transcript: ', ticker, '\n', test);
        }
    });
}
// testProcessingTranscripts()
//# sourceMappingURL=processRawTranscriptToStaging.js.map