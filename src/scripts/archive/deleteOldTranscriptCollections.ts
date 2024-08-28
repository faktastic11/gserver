/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from "dotenv";

dotenv.config({ path: `${process.cwd()}/.env` });

import { parse } from "date-fns";
import mongoose from "mongoose";
import { makeMongoURI } from "../../config/envVariables";

// this function drops any collections from our 'transcripts' db with that contains the string 'transcripts_'
const deleteOldTranscriptCollections = async () => {
  // read csv file
  const connection = await mongoose.connect(makeMongoURI("transcripts"));

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  const transcriptCollectionsNames = collections
    .filter((c) => c.name.includes("transcripts_"))
    .map((c) => c.name);

  for (const collection of transcriptCollectionsNames) {
    console.log(`Dropping collection ${collection}`);
    try {
      await db.dropCollection(collection);
    } catch (err) {
      console.error(err);
    }
  }
};
