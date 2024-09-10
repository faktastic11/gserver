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
exports.binaryClassification = void 0;
const fs = __importStar(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const envVariables_1 = require("../../config/envVariables");
const models_1 = require("../../models");
const openai_1 = require("../../services/openai");
const loggers_1 = require("../../util/loggers");
const logger = (0, loggers_1.getRegLogger)(__filename);
const openai = new openai_1.OpenAiApiHelper({ maxRetries: 5, timeout: 20000 });
let topicJson = [];
try {
    const data = fs.readFileSync("prompts/guidance_prompt.json", "utf8");
    topicJson = JSON.parse(data);
}
catch (err) {
    logger.error("Error reading the file:", err);
}
function hasProperPunctuation(text) {
    const trimmedText = text.trim();
    return [".", "!", "?"].includes(trimmedText.slice(-1));
}
function binaryClassification(rawDoc, local) {
    return __awaiter(this, void 0, void 0, function* () {
        const { _id, companyTicker, fiscalYear, fiscalQuarter, transcript } = rawDoc;
        logger.info(`classifying transcript ${_id}`);
        yield Promise.all(transcript.map((line) => __awaiter(this, void 0, void 0, function* () {
            const { text } = line;
            if (!hasProperPunctuation(text)) {
                return;
            }
            topicJson[1]["content"] = text;
            topicJson[2]["content"] =
                `Keep in mind that the fiscal year is ${fiscalYear},
     the fiscal quarter is Q${fiscalQuarter} and the company is ${companyTicker}`;
            const chatCompletion = yield openai.createChatCompletion({
                messages: topicJson,
                model: "gpt-3.5-turbo",
            });
            const result = chatCompletion.choices[0].message.content.trim();
            line["processFurther"] = result.toLowerCase().includes("true");
        })));
        if (local) {
            logger.info(`saving to csv file`);
            const csvStream = fs.createWriteStream("./data/output.csv");
            csvStream.write("Text,FurtherProcess\n");
            for (const line of transcript) {
                if (hasProperPunctuation(line["text"])) {
                    csvStream.write(`"${line["text"]}",${line["processFurther"]}\n`);
                }
            }
            csvStream.end();
        }
        else {
            rawDoc.save().catch((err) => logger.error(err));
        }
    });
}
exports.binaryClassification = binaryClassification;
function getTranscripts() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect((0, envVariables_1.makeMongoURI)("transcripts"));
        const trs = yield models_1.RawTranscript.find({
            companyTicker: "AAPL",
            fiscalYear: "2023",
            fiscalQuarter: "1",
        });
        if (!trs) {
            throw new Error("No documents matching that description");
        }
        console.log(trs);
        yield binaryClassification(trs[0], true);
    });
}
//# sourceMappingURL=binaryClassifier.js.map