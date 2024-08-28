import { Document, Schema, Types, model } from "mongoose";
import { RawTranscriptDoc } from ".";

// base interfaces used for creating documents with strong typing
export interface GPTLogType {
  companyTicker: string;
  fiscalYear: number;
  fiscalQuarter: number;
  rawTranscriptId: RawTranscriptDoc["_id"];
  gptModel: string;
  durationMetrics: {
    totalDurationSeconds?: number;
    start?: Date;
    end?: Date;
  };
  lineItems: {
    sessionId: string;
    chatId: string;
    chatgptCreatedAt: Date;
    baseContext: string;
    prompt: string;
    role: string;
    content: string;
    functionName?: string;
    functionArguments?: string;
    finishReason: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    promptCost: number;
  }[];
}

export interface GPTLogDoc extends Document, GPTLogType {}

const schemaOptions = {
  collection: "gptLogs",
  timestamps: true,
};

const GPTLogSchema = new Schema<GPTLogDoc>(
  {
    companyTicker: {
      type: String,
      required: false,
    },
    gptModel: {
      type: String,
      required: false,
    },
    fiscalYear: {
      type: Number,
      required: false,
    },
    fiscalQuarter: {
      type: Number,
      required: false,
    },
    durationMetrics: {
      totalDurationSeconds: {
        type: Number,
        required: false,
        default: function () {
          if (this.durationMetrics.start && this.durationMetrics.end) {
            return (
              (this.durationMetrics.end.getTime() -
                this.durationMetrics.start.getTime()) /
              1000
            );
          } else return null;
        },
      },
      start: {
        type: Date,
        required: false,
      },
      end: {
        type: Date,
        required: false,
      },
    },
    rawTranscriptId: {
      type: Schema.Types.ObjectId,
      ref: "rawTranscript",
      required: true,
    },
    lineItems: [
      {
        sessionId: {
          type: String,
          required: false,
        },
        chatId: {
          type: String,
          required: false,
        },
        chatgptCreatedAt: {
          type: Date,
          required: false,
        },

        baseContext: {
          type: String,
          required: false,
        },
        prompt: {
          type: String,
          required: false,
        },
        role: {
          type: String,
          required: false,
        },
        content: {
          type: String,
          required: false,
        },
        functionName: {
          type: String,
          required: false,
        },
        functionArguments: {
          type: String,
          required: false,
        },
        finishReason: {
          type: String,
          required: false,
        },
        promptTokens: {
          type: Number,
          required: false,
        },
        completionTokens: {
          type: Number,
          required: false,
        },
        totalTokens: {
          type: Number,
          required: false,
        },
        promptCost: {
          type: Number,
          required: false,
        },
      },
    ],
  },
  schemaOptions,
);

export default model<GPTLogDoc>("GPTLog", GPTLogSchema);
