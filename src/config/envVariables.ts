export const nodeEnv = process.env.NODE_ENV
if (nodeEnv === 'local') console.log(process.env)

export const port = process.env.PORT || 5001
export const openaiApiKey = process.env.OPENAI_API_KEY
export const openaiOrganizationId = process.env.OPENAI_ORGANIZATION

export const makeMongoURI = (dbName: string): string => {
  return process.env.MONGO_URI.replace('<db_name>', dbName)
}
