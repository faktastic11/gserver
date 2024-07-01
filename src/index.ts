import * as dotenv from 'dotenv'
dotenv.config({ path: `${process.cwd()}/.env` })

import express from 'express'
const app = express()

import { nodeEnv, port } from './config/envVariables'

import cors from 'cors'
import morgan from 'morgan'
import { connectToDB } from './config/server'
import { genericExpressErrorHandler } from './controllers/error'
import guidanceRoutes from './routes/guidance'
import processTranscriptRoutes from './routes/processTranscripts'
import transcriptRoutes from './routes/transcripts'
import { runSampleJob } from './scheduledJobs'

// activate morgan logging
app.use(morgan('dev'))

// establish DB connection
connectToDB().then(async () => {
  // dev stuff here
})

// set whitelist - might be temporary before other security measures are established
let whiteList: RegExp[] = [
  /^https:\/\/sequent-fin\.netlify\.app$/,
  /sequent-fin\.netlify\.app/,
  /^https:\/\/admirable-paprenjak-66e11d\.netlify\.app$/,
]

// allow local front ends into the server
if (nodeEnv === 'local') {
  whiteList = whiteList.concat([/^http:\/\/localhost:300.$/, /^http:\/\/localhost:1234$/, /^http:\/\/localhost:5173$/])
}

const corsOptions = {
  origin: (origin, callback) => {
    let found = false
    for (const reg of whiteList) {
      if (reg.test(origin)) {
        found = true
        break
      }
    }

    if (found || !origin) {
      callback(null, true)
    } else {
      callback(new Error(`Hey So This Isn't Allowed by CORS`))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

// route parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// application routes
app.use('/api', guidanceRoutes)
app.use('/api', transcriptRoutes)
app.use('/api', processTranscriptRoutes)

app.use('*', genericExpressErrorHandler)

//run scheduled jobs
if (nodeEnv !== 'local') runSampleJob()

app.listen(port, () => {
  console.log(`A ${nodeEnv ? nodeEnv.toUpperCase() : 'NO ENV FILE'} Node JS Server is listening on port ${port}`)
})
