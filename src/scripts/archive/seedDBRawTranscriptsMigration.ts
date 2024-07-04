/* eslint-disable @typescript-eslint/no-explicit-any */
// seed mongo with processed transcripts
import * as dotenv from 'dotenv'
dotenv.config({ path: `${process.cwd()}/.env` })

import { makeMongoURI } from 'config/envVariables'
import { parse } from 'date-fns'
import { RawTranscript } from 'models'
import mongoose from 'mongoose'

async function runRawTranscriptMigration() {
  // this function takes a list of collections and seeds them into the database into our new form
  await mongoose.connect(makeMongoURI('transcripts'))
  const db = mongoose.connection.db

  const collections = await db.listCollections().toArray()

  console.log(collections)

  const docsToInsert = []
  // Loop through each collection and log the collection name
  await Promise.all(
    collections.map(async ({ name: collectionName }) => {
      let ticker = ''
      if (collectionName.includes('transcripts_')) {
        ticker = collectionName.split('_')[1]
      }
      console.log(collectionName)

      const docs = await db.collection(collectionName).find({}).toArray()

      docs.forEach((doc) => docsToInsert.push({ ...doc, ticker }))
    }),
  )

  for (const doc of docsToInsert) {
    console.log(doc)

    const { _id, ticker, transcript, quarter, time_recorded: dateOfRecord } = doc

    const cleanedDate = dateOfRecord.replace('ET', '-0500')
    const dateParsed = parse(cleanedDate, 'MMM d, yyyy h:mm aaaa xx', new Date())

    const transcriptArr = Array.isArray(transcript) ? transcript : transcript.split('\n')
    const [quarterQ, fiscalYear] = quarter.split('_')
    const fiscalQuarter = quarterQ.replace('Q', '')
    const newRawDoc = await RawTranscript.create({
      companyTicker: ticker,
      companyName: ticker,
      fiscalQuarter,
      fiscalYear,
      dateOfRecord: dateParsed,
      transcript: transcriptArr,
    }).catch((err) => console.log(err))
  }
}

runRawTranscriptMigration()
