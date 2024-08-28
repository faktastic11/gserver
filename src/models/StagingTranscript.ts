import { Document, Schema, Types, model } from "mongoose";
import { RawTranscriptDoc } from ".";

export enum StagingTranscriptProcessingStage {
  PROCESSING = "processing",
  POST_PROCESSING = "post processing", // we can probably expand this when we have the number of steps we need
  DONE = "done",
  ERROR = "error",
}

export interface StagingLineItemType {
  rawLineItem: string;
  rawPeriod: string;
  rawLow: string;
  rawHigh: string;
  rawUnit: string;
  rawScale: string;
  metricType: string;
  rawTranscriptParagraph: string;
  rawTranscriptSourceSentence: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transcriptPosition: any;
  rawLineItemEmbedding: number[];
}

export interface StagingTranscriptType {
  sessionId: string;
  companyName: string;
  companyTicker: string;
  // need fiscal stuff to make querying easier
  fiscalYear: number;
  fiscalQuarter: number;
  stagingLineItems: StagingLineItemType[];
  rawTranscriptId: RawTranscriptDoc["_id"];
  processingStage: StagingTranscriptProcessingStage;
}

const schemaOptions = {
  collection: "stagingTranscripts",
  timestamps: true,
};

export interface StagingTranscriptDoc extends Document, StagingTranscriptType {}

const StagingTranscriptSchema = new Schema<StagingTranscriptDoc>(
  {
    companyName: {
      type: String,
    },
    companyTicker: {
      type: String,
      required: true,
      index: true,
    },
    rawTranscriptId: {
      type: Schema.Types.ObjectId,
      ref: "rawTranscript",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    fiscalYear: {
      type: Number,
      required: true,
    },
    fiscalQuarter: {
      type: Number,
      required: true,
    },
    processingStage: {
      type: String,
      default: StagingTranscriptProcessingStage.PROCESSING,
      enum: Object.values(StagingTranscriptProcessingStage),
    },
    stagingLineItems: [
      {
        rawLineItem: {
          type: String,
          required: false,
        },
        rawPeriod: {
          type: String,
          required: false,
        },
        rawLow: {
          type: String,
          required: false,
        },
        rawHigh: {
          type: String,
        },
        rawUnit: {
          type: String,
        },
        rawScale: {
          type: String,
        },
        metricType: {
          type: String,
          required: false,
        },
        rawTranscriptParagraph: {
          type: String,
          required: false,
        },
        rawTranscriptSourceSentence: {
          type: String,
          required: false,
        },
        transcriptPosition: {
          type: Schema.Types.Mixed,
        },
        rawLineItemEmbedding: {
          type: [Number],
          required: false,
        },
      },
    ],
  },
  schemaOptions,
);

StagingTranscriptSchema.index({ companyTicker: 1 });
StagingTranscriptSchema.index({
  companyTicker: 1,
  fiscalYear: 1,
  fiscalQuarter: 1,
});
StagingTranscriptSchema.index({ createdAt: -1 });
StagingTranscriptSchema.index({ updatedAt: -1 });
StagingTranscriptSchema.index({ processingStage: -1 });
StagingTranscriptSchema.index({ rawTranscriptId: -1 });

export default model<StagingTranscriptDoc>(
  "stagingTranscript",
  StagingTranscriptSchema,
);
