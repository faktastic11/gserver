/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv'
import * as fs from 'fs'
dotenv.config({ path: `${process.cwd()}/.env` })

import { makeMongoURI } from 'config/envVariables'
import { parse } from 'date-fns'
import { RawTranscript } from 'models'
import mongoose from 'mongoose'

async function runRawTranscriptSeed() {
  // this function takes txt for a raw transcript and inserts it into the raw transcript collection
  await mongoose.connect(makeMongoURI('transcripts'))

  const ticker = 'ADSK'
  const fiscalQuarter = 1
  const fiscalYear = 2024

  const dateOfRecord = new Date('2024-05-25T21:00:00.000Z')

  const filePath = `${process.cwd()}/data/ADSK_Q1_2024_RawTranscript.txt`

  // read file
  const transcript = fs.readFileSync(filePath, 'utf8')
  const transcriptArr = transcript.split('\n')

  const newRawDoc = await RawTranscript.create({
    companyTicker: ticker,
    companyName: ticker,
    fiscalQuarter,
    fiscalYear,
    dateOfRecord,
    transcript: transcriptArr,
  }).catch((err) => console.log(err))
}

runRawTranscriptSeed()
