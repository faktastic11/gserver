import * as dotenv from "dotenv";
import fs from "fs";
import OpenAI, { ClientOptions } from "openai";
import { ChatCompletion } from "openai/resources/chat/completions";
import { openaiApiKey, openaiOrganizationId } from "../config/envVariables";

export class OpenAiApiHelper {
  private key;
  private org;
  private openai;

  constructor({ maxRetries, timeout }) {
    dotenv.config({ path: `${process.cwd()}/.env` });

    this.org = openaiOrganizationId;

    this.openai = new OpenAI({
      apiKey: openaiApiKey,
      organization: this.org,
      maxRetries,
      timeout,
    });
  }

  createChatCompletion({
    messages,
    model,
    temperature = undefined,
    presencePenalty = undefined,
    functions = undefined,
    functionCall = undefined,
    timeout = undefined,
    retries = 0,
  }): Promise<ChatCompletion> {
    return this.openai.chat.completions.create(
      {
        messages,
        model,
        ...(functions && { functions }),
        ...(functionCall && { name: functionCall }),
        ...(temperature && { temperature }),
        ...(presencePenalty && { presencePenalty }),
      },
      {
        ...(timeout && { timeout }),
        retries,
      },
    );
  }

  getEmbeddings = async ({ text, model = "text-embedding-ada-002" }) => {
    text = text.replace("\n", " ");
    const returnPromise = this.openai.embeddings.create({
      input: text,
      model: model,
    });
    const embeddings = await returnPromise;
    return embeddings.data[0].embedding;
  };

  finetuneModel(path, purpose = "fine-tune") {
    const fileUpload = this.openai.files.create({
      file: fs.createReadStream(path),
      purpose: purpose,
    });
    const fineTune = this.openai.fineTuning.jobs.create({
      training_file: fileUpload,
      model: "gpt-3.5-turbo",
    });
    return fineTune;
  }
}

export const perTokenCost = {
  "gpt-4-preview-1106": {
    input: 0.00001,
    output: 0.00003,
  },
  "gpt-4": {
    input: 0.00003,
    output: 0.00006,
  },
  "gpt-4-0613": {
    input: 0.00003,
    output: 0.00006,
  },
  "gpt-4-32k": {
    input: 0.00006,
    output: 0.00012,
  },
  "gpt-3.5-turbo": {
    input: 0.0000015,
    output: 0.000002,
  },
  "gpt-3.5-turbo-0613": {
    input: 0.0000015,
    output: 0.000002,
  },
  "gpt-3.5-turbo-16k": {
    input: 0.000003,
    output: 0.000004,
  },
};
