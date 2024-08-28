import { nodeEnv } from "config/envVariables";
import { createObjectCsvWriter } from "csv-writer";
import { format as dateFormat } from "date-fns";
import * as fs from "fs";
import * as ld from "lodash";
import { ChatCompletion } from "openai/resources/chat/completions";
import { PassThrough } from "stream";
import { createLogger, format as logFormat, transports } from "winston";

const LOGS_DIR = "./logs";

// create logs directory if it doesn't exist
// if (!fs.existsSync(LOGS_DIR)) {
//   fs.mkdirSync(LOGS_DIR);
// }

// Completions reference - https://platform.openai.com/docs/api-reference/completions
type CompletionLogEntry = {
  // formatted string version of unix created time
  createdDate: string;
  env: string;
} & ChatCompletion;
export class OpenAICompletionLogger {
  // TODO: implement console logger as well? we don't use it yet in the python version

  private csvWriter: ReturnType<typeof createObjectCsvWriter>;
  private logToDB: boolean;
  private headers: { id: string; title: string }[];
  private filePath: string;

  constructor(csvFilePath: string, logToDB = false) {
    this.filePath = csvFilePath;
    this.logToDB = logToDB;
    this.headers = [
      { id: "environment", title: "env" },
      { id: "createdDate", title: "created" },
      { id: "created", title: "unixCreated" },
    ];
    this.csvWriter = createObjectCsvWriter({
      header: this.headers,
      path: this.filePath,
      append: true,
    });
    this.createFileAndWriteHeaders();
  }

  async createFileAndWriteHeaders() {
    try {
      // wx creates a file if its not there
      fs.writeFileSync(this.filePath, "");
      fs.accessSync(this.filePath);
      const st = fs.statSync(this.filePath);
      if (st.size > 0) {
        // write header first
        this.csvWriter.writeRecords(
          this.headers.map(({ id, title }) => ({ [id]: title })),
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async log(chatCompletionResObj: ChatCompletion) {
    // unix time stamp --> date --> formatted string
    const logEntry = ld.cloneDeep(chatCompletionResObj) as CompletionLogEntry;

    logEntry.createdDate = dateFormat(
      new Date(logEntry.created * 1000),
      "yyyy-MM-dd HH:mm:ss",
    );
    logEntry.env = nodeEnv;

    // flatten out completion to write to csv record
    const logger_row = [process.env.NODE_ENV, logEntry.createdDate];

    await this.csvWriter.writeRecords([logger_row]);
  }
}

// for regular logging through out the app
export const getRegLogger = (logFileName) => {
  const { combine, timestamp, printf } = logFormat;
  const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} | ${level} | ${message}`;
  });

  return createLogger({
    format: combine(timestamp(), myFormat),
    transports: [
      new transports.Console({ level: "debug" }),
      // new transports.File({
      //   filename: `${LOGS_DIR}/${logFileName}_${new Date()}.log`,
      //   level: 'debug',
      // }),
    ],
  });
};
