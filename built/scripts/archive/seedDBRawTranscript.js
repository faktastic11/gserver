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
/* eslint-disable @typescript-eslint/no-explicit-any */
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
dotenv.config({ path: `${process.cwd()}/.env` });
const envVariables_1 = require("config/envVariables");
const models_1 = require("models");
const mongoose_1 = __importDefault(require("mongoose"));
function runRawTranscriptSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        // this function takes txt for a raw transcript and inserts it into the raw transcript collection
        yield mongoose_1.default.connect((0, envVariables_1.makeMongoURI)("transcripts"));
        const ticker = "ADSK";
        const fiscalQuarter = 1;
        const fiscalYear = 2024;
        const dateOfRecord = new Date("2024-05-25T21:00:00.000Z");
        const filePath = `${process.cwd()}/data/ADSK_Q1_2024_RawTranscript.txt`;
        // read file
        const transcript = fs.readFileSync(filePath, "utf8");
        const transcriptArr = transcript.split("\n");
        const newRawDoc = yield models_1.RawTranscript.create({
            companyTicker: ticker,
            companyName: ticker,
            fiscalQuarter,
            fiscalYear,
            dateOfRecord,
            transcript: transcriptArr,
        }).catch((err) => console.log(err));
    });
}
runRawTranscriptSeed();
//# sourceMappingURL=seedDBRawTranscript.js.map