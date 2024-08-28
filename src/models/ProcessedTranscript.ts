import { Document, Schema, Types, model } from "mongoose";
import { RawTranscriptDoc } from ".";

// base interfaces used for creating documents with strong typing
export interface ProcessedTranscriptType {
  companyName: string;
  companyTicker: string;
  lineItem: string;
  metricType: string;
  valueCategory: string;
  guidancePeriod: {
    fiscalYear?: number;
    fiscalQuarter?: number;
    raw: string;
  };
  transcriptPeriod: {
    fiscalYear: number;
    fiscalQuarter: number;
    reportDate: Date;
  };
  value: {
    raw: { low: string; high: string; unit: string; scale: string };
    low?: { amt: number; unit: string; scale: string };
    mid?: { amt: number; unit: string; scale: string };
    high?: { amt: number; unit: string; scale: string };
  };
  rawTranscriptSourceSentence: string;
  rawTranscriptSourceParagraph?: string;
  transcriptPosition?: { startLine: number; endLine: number };
  rawTranscriptId: RawTranscriptDoc["_id"];
}

export interface ProcessedTranscriptDoc
  extends Document,
    ProcessedTranscriptType {
  rawTranscriptId: Types.ObjectId;
}

const schemaOptions = {
  collection: "processedTranscripts",
  timestamps: true,
};

const valueItemSchema = {
  type: {
    amt: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    scale: {
      type: String,
      required: false,
    },
  },
  required: false,
};

const ProcessedTranscriptSchema = new Schema<ProcessedTranscriptDoc>(
  {
    companyName: {
      type: String,
      required: true,
      index: true,
    },
    companyTicker: {
      type: String,
      required: true,
      index: true,
    },
    lineItem: {
      type: String,
      required: true,
    },
    metricType: {
      type: String,
      required: true,
    },
    valueCategory: {
      type: String,
      required: true,
      default: "unknown",
    },
    value: {
      low: valueItemSchema,
      mid: valueItemSchema,
      high: valueItemSchema,
      actual: valueItemSchema,
      raw: { low: String, high: String, unit: String, scale: String },
    },
    guidancePeriod: {
      fiscalYear: {
        type: Number,
        required: false,
        index: true,
      },
      fiscalQuarter: {
        type: Number,
        required: false,
        index: true,
      },
      raw: {
        type: String,
        required: false,
      },
    },
    transcriptPeriod: {
      fiscalYear: {
        type: Number,
        index: true,
      },
      fiscalQuarter: {
        type: Number,
        required: false,
        index: true,
      },
      reportDate: {
        type: Date,
        required: true,
        index: true,
      },
    },
    rawTranscriptSourceSentence: {
      type: String,
      required: true,
    },
    rawTranscriptSourceParagraph: {
      type: String,
      required: false,
    },
    transcriptPosition: {
      startLine: {
        type: Number,
        required: false,
      },
      endLine: {
        type: Number,
        required: false,
      },
    },
    rawTranscriptId: {
      type: Schema.Types.ObjectId,
      ref: "rawTranscript",
      required: true,
    },
  },
  schemaOptions,
);

ProcessedTranscriptSchema.index({
  companyTicker: 1,
  fiscalYear: 1,
  fiscalQuarter: 1,
});
ProcessedTranscriptSchema.index(
  {
    companyTicker: 1,
    fiscalYear: 1,
    fiscalQuarter: 1,
    lineItem: 1,
    reportDate: 1,
  },
  { unique: true },
);

export default model<ProcessedTranscriptDoc>(
  "processedTranscript",
  ProcessedTranscriptSchema,
);
