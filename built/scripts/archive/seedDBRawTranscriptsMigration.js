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
// seed mongo with processed transcripts
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: `${process.cwd()}/.env` });
const envVariables_1 = require("config/envVariables");
const date_fns_1 = require("date-fns");
const models_1 = require("models");
const mongoose_1 = __importDefault(require("mongoose"));
function runRawTranscriptMigration() {
    return __awaiter(this, void 0, void 0, function* () {
        // this function takes a list of collections and seeds them into the database into our new form
        yield mongoose_1.default.connect((0, envVariables_1.makeMongoURI)("transcripts"));
        const db = mongoose_1.default.connection.db;
        const collections = yield db.listCollections().toArray();
        console.log(collections);
        const docsToInsert = [];
        // Loop through each collection and log the collection name
        yield Promise.all(collections.map(({ name: collectionName }) => __awaiter(this, void 0, void 0, function* () {
            let ticker = "";
            if (collectionName.includes("transcripts_")) {
                ticker = collectionName.split("_")[1];
            }
            console.log(collectionName);
            const docs = yield db.collection(collectionName).find({}).toArray();
            docs.forEach((doc) => docsToInsert.push(Object.assign(Object.assign({}, doc), { ticker })));
        })));
        for (const doc of docsToInsert) {
            console.log(doc);
            const { _id, ticker, transcript, quarter, time_recorded: dateOfRecord, } = doc;
            const cleanedDate = dateOfRecord.replace("ET", "-0500");
            const dateParsed = (0, date_fns_1.parse)(cleanedDate, "MMM d, yyyy h:mm aaaa xx", new Date());
            const transcriptArr = Array.isArray(transcript)
                ? transcript
                : transcript.split("\n");
            const [quarterQ, fiscalYear] = quarter.split("_");
            const fiscalQuarter = quarterQ.replace("Q", "");
            const newRawDoc = yield models_1.RawTranscript.create({
                companyTicker: ticker,
                companyName: ticker,
                fiscalQuarter,
                fiscalYear,
                dateOfRecord: dateParsed,
                transcript: transcriptArr,
            }).catch((err) => console.log(err));
        }
    });
}
runRawTranscriptMigration();
//# sourceMappingURL=seedDBRawTranscriptsMigration.js.map