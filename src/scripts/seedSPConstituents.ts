/* eslint-disable @typescript-eslint/no-explicit-any */
import CSVReadableStream from "csv-reader";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { Company } from "models";

dotenv.config({ path: `${process.cwd()}/.env` });

import { makeMongoURI } from "config/envVariables";
import mongoose from "mongoose";

const processSPConstituents = async () => {
  // read csv file
  await mongoose.connect(makeMongoURI("transcripts"));

  const filePath = `${process.cwd()}/data/sp_constituents.csv`;
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
        ticker,
        companyName,
        sector,
        subIndustry,
        hqLocation,
        dateAdded,
        cik,
        founded,
      } = row;

      const newCompanyDoc = await Company.create({
        companyTicker: ticker,
        companyName,
        gics: {
          sector,
          subIndustry,
        },
      });
    });
};
processSPConstituents();
