import util from 'util'
class ApiError extends Error {
  systemMessage: string
  additionalInfo: string
  apiPath: string
  statusCode: number
  body: Record<string, string>
  query: Record<string, string>
  params: Record<string, string>

  constructor(err, additionalInfo, statusCode: number, apiPath: string, body?, query?, params?) {
    super(err)
    this.systemMessage = err.message
    this.additionalInfo = additionalInfo
    this.apiPath = apiPath
    this.statusCode = statusCode
    this.stack = err.stack || null
    this.body = body
    this.query = query
    this.params = params
  }
}

export const logApiError = (req, res, next, err, statusCode = 500, additionalInfo = '') => {
  const path = req.originalUrl

  console.error(err)

  next(new ApiError(err, additionalInfo, statusCode, path, req.body, req.query, req.params))
}

export const logServerError = (customMessage, err, throwE = false) => {
  console.log('\n', customMessage)
  console.error(err.message)
  console.error(err.stack)
  console.log('\n')

  if (throwE) throw `${customMessage}-${err.message}`
}

export const genericExpressErrorHandler = (err, req, res, next) => {
  const { statusCode = 500 } = err

  console.error('\n')
  console.error(`Error at Route: ${err.apiPath}`)
  console.error(`Custom Message: ${util.inspect(err.additionalInfo, true, 4, true)}`)
  console.error(`System Message: ${err.systemMessage}`)
  if (Object.keys(err.params).length) console.error(`Params: ${util.inspect(err.params, true, 4, true)}`)
  if (Object.keys(err.query).length) console.error(`Query: ${util.inspect(err.query, true, 4, true)}`)
  if (Object.keys(err.body).length) console.error(`Body: ${util.inspect(err.body, true, 4, true)}`)
  // console.error(`Stack Message: ${err.stack}`);

  delete err.statusCode
  delete err.stack
  return res.status(statusCode).json({ Error: err })
}
