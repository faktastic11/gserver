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
dotenv.config({ path: `${process.cwd()}/.env` });
const mongoose_1 = __importDefault(require("mongoose"));
const envVariables_1 = require("../../config/envVariables");
// this function drops any collections from our 'transcripts' db with that contains the string 'transcripts_'
const deleteOldTranscriptCollections = () => __awaiter(void 0, void 0, void 0, function* () {
    // read csv file
    const connection = yield mongoose_1.default.connect((0, envVariables_1.makeMongoURI)("transcripts"));
    const db = mongoose_1.default.connection.db;
    const collections = yield db.listCollections().toArray();
    const transcriptCollectionsNames = collections
        .filter((c) => c.name.includes("transcripts_"))
        .map((c) => c.name);
    for (const collection of transcriptCollectionsNames) {
        console.log(`Dropping collection ${collection}`);
        try {
            yield db.dropCollection(collection);
        }
        catch (err) {
            console.error(err);
        }
    }
});
//# sourceMappingURL=deleteOldTranscriptCollections.js.map