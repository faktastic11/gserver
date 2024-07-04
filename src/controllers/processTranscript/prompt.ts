import e from 'cors'
import { randomUUID } from 'crypto'
import { OpenAI } from 'openai'
import { Embeddings } from 'openai/resources'
import { ChatCompletion } from 'openai/resources/chat'
import { perTokenCost } from 'services/openai'
import { getRegLogger } from 'util/loggers'
import { OpenAiApiHelper } from '../../services/openai'

/* eslint-disable @typescript-eslint/no-explicit-any */

const logger = getRegLogger(__filename)

export class GPTPrompt {
  public role: string
  public content: string
  public temp: number
  public presencePenalty: number
  public metaData: object
  public responseType: string
  public nextPromptKey: string
  public _response: string
  public promptName: string

  constructor({
    role,
    content,
    metaData,
    temp,
    presencePenalty,
    responseType,
    nextPromptKey,
    _response,
    promptName,
  }: {
    role: string
    content: string
    metaData?: object
    temp?: number
    presencePenalty?: number
    responseType?: string
    nextPromptKey?: string
    _response?: string
    promptName?: string
  }) {
    this.role = role
    this.content = content
    this.metaData = metaData
    this.temp = temp !== undefined ? temp : this.temp
    this.presencePenalty = presencePenalty !== undefined ? presencePenalty : this.presencePenalty
    this.responseType = responseType !== undefined ? responseType : this.responseType
    this.nextPromptKey = nextPromptKey !== undefined ? nextPromptKey : this.nextPromptKey
    this._response = _response !== undefined ? _response : this._response
    this.promptName = promptName || 'dunnom8'
    this.postInit({ promptName: null, content: content, contentData: this.metaData })
  }

  async postInit({ promptName, content, contentData }) {
    this.promptName = promptName || 'dunnom8'
    this.content = this.formatString({ string: content, replacements: contentData })
  }

  promptDict() {
    return { role: this.role, content: this.content }
  }

  formatString = ({ string, replacements }: { string: string; replacements: Record<string, string> }): string => {
    return string.replace(/\{([^}]+)\}/g, (match, key) => {
      // eslint-disable-next-line no-prototype-builtins
      return replacements.hasOwnProperty(key) ? replacements[key] : match
    })
  }
}

export class OpenAICompletion {
  /*
        Parse open ai chat completion response
    */
  public sessionId: string
  public prompts: GPTPrompt
  public chatCompletionResponse: ChatCompletion //rawResponse
  public chatId: string
  public created: number
  public model: string
  public role: string
  public content: string
  public functionName: string
  public functionArgs: any
  public finishReason: string
  public promptTokens: number
  public completionTokens: number
  public totalTokens: number
  public cost: number | 0

  constructor({ sessionId, prompts, chatCompletionResponse }) {
    this.sessionId = sessionId
    this.prompts = prompts
    this.chatCompletionResponse = chatCompletionResponse

    this.chatId = this.chatCompletionResponse.id
    this.created = this.chatCompletionResponse.created
    this.model = this.chatCompletionResponse.model

    const { message: resMessage, finish_reason } = this.chatCompletionResponse.choices[0]

    this.role = resMessage.role
    this.content = resMessage.content

    this.functionName = resMessage.function_call?.name
    this.functionArgs = resMessage.function_call?.arguments

    this.finishReason = finish_reason

    const { prompt_tokens, completion_tokens, total_tokens } = chatCompletionResponse.usage

    this.promptTokens = prompt_tokens
    this.completionTokens = completion_tokens
    this.totalTokens = total_tokens

    try {
      this.cost =
        this.promptTokens * perTokenCost[this.model].input + this.completionTokens * perTokenCost[this.model].output
    } catch (err) {
      this.cost = 0
    }
  }
}

export class ChatGPTSession {
  public terminationKey: string
  public baseContext: GPTPrompt[]
  public defaultModel: string
  public pastPrompts: GPTPrompt[]
  public sessionId: string
  public currentPrompt: GPTPrompt | null
  public openai: OpenAiApiHelper

  constructor({
    model,
    terminationKey,
    baseContext,
  }: {
    model: string
    terminationKey: string
    baseContext?: GPTPrompt[]
  }) {
    this.defaultModel = model
    this.terminationKey = terminationKey
    this.baseContext = baseContext || []
    this.pastPrompts = []

    this.sessionId = randomUUID()
    this.currentPrompt = null
    this.openai = new OpenAiApiHelper({ maxRetries: 5, timeout: 100000 })
  }

  openAIGPTAPICall = async ({
    prompt,
    model = this.defaultModel,
    availableFunctions = undefined,
    functionCall = 'auto',
  }: {
    prompt: GPTPrompt
    model?: string
    includeBaseContext?: boolean
    availableFunctions?: any
    functionCall?: string
  }): Promise<[any, OpenAICompletion]> => {
    // TODO: retry delays possible?
    const completionResponse = await this.openai.createChatCompletion({
      model,
      messages: [prompt.promptDict()],
      temperature: prompt.temp,
      presencePenalty: prompt.presencePenalty,
    })

    const response = new OpenAICompletion({
      sessionId: this.sessionId,
      prompts: prompt,
      chatCompletionResponse: completionResponse,
      ...(availableFunctions && { availableFunctions }),
      ...(availableFunctions && { functionCall }),
    })

    prompt._response = response.content

    this.pastPrompts.push(prompt)

    return [this.processResponse(prompt, response), response]
  }

  processResponse(prompt: GPTPrompt, response: OpenAICompletion) {
    logger.debug(response.content)
    if (response.content === this.terminationKey) return null
    try {
      if (prompt.responseType === 'str') {
        return response.content
      } else if (prompt.responseType === 'json_object') {
        try {
          const regex = /\[\s*(.*?)\s*\]/s
          const matches = response.content.match(regex)
          if (matches.length > 0) {
            try {
              // Parse the extracted string into a JSON object
              return JSON.parse(`[${matches[1]}]`)
            } catch (error) {
              console.error('Error parsing JSON: ', error)
            }
          } else {
            console.log('No match found')
          }
        } catch (err) {
          logger.error('Could no parse JSON at all \n content: ', response.content)
        }
      } else if (prompt.responseType === 'table') {
        const rows = response.content.split('\n')
        const formatted = rows.map((row) => {
          const fields = row.split('|')
          let i: number
          if (fields[0] == '') {
            i = 1
          } else {
            i = 0
          }
          const rawLineItem = fields[i]
          const rawPeriod = fields[i + 1]
          const rawLow = fields[i + 2]
          const rawHigh = fields[i + 3]
          const rawUnit = fields[i + 4]
          const rawScale = fields[i + 5]
          const metricType = fields[i + 6]
          const rawTranscriptSourceSentence = fields[i + 7]
          return {
            rawLineItem: rawLineItem,
            rawPeriod: rawPeriod,
            rawLow: rawLow,
            rawHigh: rawHigh,
            rawUnit: rawUnit,
            rawScale: rawScale,
            metricType: metricType,
            rawTranscriptSourceSentence: rawTranscriptSourceSentence,
          }
        })
        return formatted
      } else if (prompt.responseType === 'list') {
        return response.content.split('|').map((line) => line.trim())
      } else if (prompt.responseType === 'bool') {
        return response.content.toLowerCase().includes('true')
      } else if (prompt.responseType === 'float') {
        return parseFloat(response.content)
      } else if (prompt.responseType === 'int') {
        return parseInt(response.content)
      } else {
        throw Error('Invalid response type')
      }
    } catch (err) {
      logger.error(err)
      throw Error('Could not process response')
    }
  }

  getEmbeddings = async ({ text }) => {
    return await this.openai.getEmbeddings({ text })
  }
}
