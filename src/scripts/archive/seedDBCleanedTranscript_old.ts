/* eslint-disable @typescript-eslint/no-explicit-any */
import CSVReadableStream from 'csv-reader'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { ProcessedTranscript } from '../../models'

dotenv.config({ path: `${process.cwd()}/.env` })

import { parse } from 'date-fns'
import mongoose from 'mongoose'
import { makeMongoURI } from '../../config/envVariables'

const parseLineItemValue = (value: string): { amt: number | null; unit: string | null; qualitative: boolean } => {
  // this is really just tailored to seed data we've cleaned already
  if (value.split(' ').length > 1) {
    return { amt: null, unit: null, qualitative: true }
  }

  if (value[0] === '$') {
    return { amt: parseFloat(value.slice(1).replace(/,/g, '')), unit: 'USD', qualitative: false }
  }

  if (value[value.length - 1] === '%') {
    return { amt: parseFloat(value.slice(0, value.length - 1)), unit: 'percent', qualitative: false }
  }

  return { amt: null, unit: null, qualitative: true }
}

// parse time period from csv
const parseTimePeriod = (timePeriod: string): { fiscalQuarter: number | null; fiscalYear: number } => {
  const [w1, w2] = timePeriod.split(' ')

  if (w1 === 'Fiscal') {
    // Fiscal 2024
    return { fiscalQuarter: null, fiscalYear: Number(w2) }
  } else {
    // Q1 2024
    return { fiscalQuarter: Number(w1.slice(1)), fiscalYear: Number(w2) }
  }
}

// this function takes csv for a cleaned transcript line items and inserts them as separate
// documents into the processedTranscripts collection
const insertProcessedTranscript = async () => {
  // read csv file
  await mongoose.connect(makeMongoURI('transcripts'))

  const ticker = 'ADSK'

  const dateOfRecord = new Date('2023-05-25T21:00:00.000Z')
  const filePath = `${process.cwd()}/data/ADSK_Q1_2024_Cleaned.csv`
  const inputStream = fs.createReadStream(filePath, 'utf8')
  inputStream
    .pipe(CSVReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, asObject: true }))
    .on('data', async (row: any) => {
      // row is an array of CSV column data mapped to object properties
      const { lineItemName, timePeriod, low, high, sourceSentence, valueCategory } = row

      const { amt: amtLow, unit: unitLow, qualitative: qualitativeLow } = parseLineItemValue(low)
      const { amt: amtHigh, unit: unitHigh, qualitative: qualitativeHigh } = parseLineItemValue(high)
      const { fiscalQuarter: guidanceQtr, fiscalYear: guidanceYr } = parseTimePeriod(timePeriod)

      const newProcessedDoc = await ProcessedTranscript.create({
        companyTicker: ticker,
        companyName: ticker,
        guidancePeriod: {
          fiscalQuarter: guidanceQtr,
          fiscalYear: guidanceYr,
          raw: timePeriod,
        },
        transcriptPeriod: {
          fiscalQuarter: 1,
          fiscalYear: 2024,
          reportDate: dateOfRecord,
        },
        lineItem: lineItemName,
        metricType: 'Guidance',
        valueCategory,
        value: {
          ...(amtLow && { low: { amt: amtLow, unit: unitLow } }),
          ...(amtHigh && { high: { amt: amtHigh, unit: unitHigh } }),
          ...(amtLow && amtHigh && { mid: { amt: (amtLow + amtHigh) / 2, unit: unitLow } }),
          ...(qualitativeLow && { qualitative: low }),
        },
        rawTranscriptSourceSentence: sourceSentence,
        rawTranscriptId: '64dc3725a374406d3ca87ee7',
      })
    })
}
insertProcessedTranscript()
