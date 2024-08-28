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
exports.getRegLogger = exports.OpenAICompletionLogger = void 0;
const envVariables_1 = require("../config/envVariables");
const csv_writer_1 = require("csv-writer");
const date_fns_1 = require("date-fns");
const fs = __importStar(require("fs"));
const ld = __importStar(require("lodash"));
const winston_1 = require("winston");
const LOGS_DIR = "./logs";
class OpenAICompletionLogger {
    constructor(csvFilePath, logToDB = false) {
        this.filePath = csvFilePath;
        this.logToDB = logToDB;
        this.headers = [
            { id: "environment", title: "env" },
            { id: "createdDate", title: "created" },
            { id: "created", title: "unixCreated" },
        ];
        this.csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            header: this.headers,
            path: this.filePath,
            append: true,
        });
        this.createFileAndWriteHeaders();
    }
    createFileAndWriteHeaders() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // wx creates a file if its not there
                fs.writeFileSync(this.filePath, "");
                fs.accessSync(this.filePath);
                const st = fs.statSync(this.filePath);
                if (st.size > 0) {
                    // write header first
                    this.csvWriter.writeRecords(this.headers.map(({ id, title }) => ({ [id]: title })));
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    log(chatCompletionResObj) {
        return __awaiter(this, void 0, void 0, function* () {
            // unix time stamp --> date --> formatted string
            const logEntry = ld.cloneDeep(chatCompletionResObj);
            logEntry.createdDate = (0, date_fns_1.format)(new Date(logEntry.created * 1000), "yyyy-MM-dd HH:mm:ss");
            logEntry.env = envVariables_1.nodeEnv;
            // flatten out completion to write to csv record
            const logger_row = [process.env.NODE_ENV, logEntry.createdDate];
            yield this.csvWriter.writeRecords([logger_row]);
        });
    }
}
exports.OpenAICompletionLogger = OpenAICompletionLogger;
// for regular logging through out the app
const getRegLogger = (logFileName) => {
    const { combine, timestamp, printf } = winston_1.format;
    const myFormat = printf(({ level, message, timestamp }) => {
        return `${timestamp} | ${level} | ${message}`;
    });
    return (0, winston_1.createLogger)({
        format: combine(timestamp(), myFormat),
        transports: [
            new winston_1.transports.Console({ level: "debug" }),
            // new transports.File({
            //   filename: `${LOGS_DIR}/${logFileName}_${new Date()}.log`,
            //   level: 'debug',
            // }),
        ],
    });
};
exports.getRegLogger = getRegLogger;
//# sourceMappingURL=loggers.js.map