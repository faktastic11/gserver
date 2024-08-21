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
const envVariables_1 = require("config/envVariables");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const models_1 = require("models");
const mongoose_1 = __importDefault(require("mongoose"));
const openai_1 = require("services/openai");
const util_1 = require("util");
const processRawTranscriptToStaging_1 = require("./processRawTranscriptToStaging");
const prompt_1 = require("./prompt");
const readdir = (0, util_1.promisify)(fs_1.default.readdir);
const writeFile = (0, util_1.promisify)(fs_1.default.writeFile);
function createTrainingFile(prod) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('running');
        yield mongoose_1.default.connect((0, envVariables_1.makeMongoURI)('transcripts'));
        const results = [];
        const extractionJSON = (0, processRawTranscriptToStaging_1.readPrompt)('prompts/extraction_prompt.json');
        const extractJSON = extractionJSON['extract_line_items'];
        const filePath = './data/training/trainingFile.txt';
        try {
            const files = yield readdir('./data/training');
            const fileProcessingPromises = files
                .filter((file) => file.endsWith('.csv'))
                .map((file) => {
                return new Promise((resolve, reject) => {
                    const dataPromises = [];
                    fs_1.default.createReadStream(`./data/${file}`)
                        .pipe((0, csv_parser_1.default)())
                        .on('data', (data) => {
                        const dataPromise = (() => __awaiter(this, void 0, void 0, function* () {
                            const { rawTranscriptParagraph, rawTranscriptId } = data;
                            const rawTranscript = yield models_1.RawTranscript.findOne({ id: rawTranscriptId });
                            const extractPrompt = new prompt_1.GPTPrompt({
                                role: 'user',
                                content: extractJSON['content'],
                                metaData: {
                                    companyName: rawTranscript.companyName,
                                    thisQuarter: 'Q' + rawTranscript.fiscalQuarter,
                                    thisYear: rawTranscript.fiscalYear,
                                    nextQuarter: 'Q' + (rawTranscript.fiscalQuarter + 1),
                                    nextYear: rawTranscript.fiscalYear + 1,
                                    excerpt: rawTranscriptParagraph,
                                },
                                responseType: extractJSON['response_type'],
                                temp: 0,
                            });
                            const assistantData = {
                                rawLineItem: data.rawLineItem,
                                rawPeriod: data.rawPeriod,
                                rawLow: data.rawLow,
                                rawHigh: data.rawHigh,
                                rawUnit: data.rawUnit,
                                rawScale: data.rawScale,
                                metricType: data.metricType,
                                rawTranscriptSourceSentence: data.rawTranscriptSourceSentence,
                            };
                            const formattedAssistantData = `[${JSON.stringify(assistantData)}]`;
                            const formattedData = {
                                messages: [
                                    { system: extractPrompt.content },
                                    { user: data.RawSourceParagraph },
                                    { assistant: formattedAssistantData },
                                ],
                            };
                            results.push(formattedData);
                        }))();
                        dataPromises.push(dataPromise);
                    })
                        .on('end', () => {
                        Promise.all(dataPromises)
                            .then(() => resolve())
                            .catch(reject);
                    })
                        .on('error', reject);
                });
            });
            yield Promise.all(fileProcessingPromises);
            yield writeFile(filePath, JSON.stringify(results, null, 4));
            console.log('Successfully written to file');
        }
        catch (err) {
            console.error('Error:', err);
        }
        if (prod) {
            uploadTrainingFile(filePath);
        }
    });
}
exports.default = createTrainingFile;
function uploadTrainingFile(path) {
    const openAI = new openai_1.OpenAiApiHelper({ maxRetries: 2, timeout: 10000 });
    openAI.finetuneModel(path);
}
//# sourceMappingURL=trainGPT.js.map