/* eslint-disable @typescript-eslint/no-explicit-any */

// This script was using an old log version

import CSVReadableStream from "csv-reader";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { GPTLog } from "../../models";

dotenv.config({ path: `${process.cwd()}/.env` });

import { parse } from "date-fns";
import mongoose from "mongoose";
import { makeMongoURI } from "../../config/envVariables";

const processPromptLogs = async () => {
  // read csv file
  await mongoose.connect(makeMongoURI("transcripts"));

  const filePath = `${process.cwd()}/data/promptLog_20230821.csv`;
  const inputStream = fs.createReadStream(filePath, "utf8");
  inputStream
    .pipe(
      CSVReadableStream({
        parseNumbers: true,
        parseBooleans: true,
        trim: true,
        asObject: true,
      }),
    )
    .on("data", async (row: any) => {
      // row is an array of CSV column data mapped to object properties
      const {
        logCreatedAt,
        logType,
        sessionId,
        chatId,
        chatgptCreatedAt,
        model,
        baseContext,
        prompt,
        role,
        content,
        functionName,
        functionArguments,
        finishReason,
        promptTokens,
        completionTokens,
        totalTokens,
        promptCost,
      } = row;

      const chatgptCreatedAtDateObj = new Date(chatgptCreatedAt * 1000);
      const logCreatedAtDateObj = parse(
        logCreatedAt,
        "yyyy-MM-dd HH:mm:ss",
        new Date(),
      );
      // const newPromptLogDoc = await PromptLog.create({
      //   logCreatedAt: logCreatedAtDateObj,
      //   logType,
      //   sessionId,
      //   chatId,
      //   chatgptCreatedAt: chatgptCreatedAtDateObj,
      //   model,
      //   baseContext,
      //   prompt,
      //   role,
      //   content,
      //   functionName,
      //   functionArguments,
      //   finishReason,
      //   promptTokens,
      //   completionTokens,
      //   totalTokens,
      //   promptCost,
      // })
    });
};
// processPromptLogs()
