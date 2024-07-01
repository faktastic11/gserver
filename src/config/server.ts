import { makeMongoURI } from 'config/envVariables'
import { connect } from 'mongoose'

const mongoURI = makeMongoURI('transcripts')
export const connectToDB = async (): Promise<void> => {
  connect(mongoURI).catch((err) => {
    console.error('Error connecting to Mongo DB server\n')
    console.error(err.message)
  })
  // set('debug', true)
  console.log(`Connected To  Mongo DB Server at address ${mongoURI}\n`)
}
