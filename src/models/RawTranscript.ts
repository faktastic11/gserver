import { Document, Schema, Types, model } from "mongoose";

// base interfaces used for creating documents with strong typing
export interface RawTranscriptType {
  companyName: string;
  companyTicker: string;
  dateOfRecord: Date;
  fiscalYear: number;
  fiscalQuarter: number;
  transcript: { text: string; processFurther: boolean | null }[];
}

export interface RawTranscriptDoc extends Document, RawTranscriptType {
  transcript: Types.Array<{ text: string; processFurther: boolean | null }>;
}

const schemaOptions = {
  collection: "rawTranscripts",
  timestamps: true,
};

const RawTranscriptSchema = new Schema<RawTranscriptDoc>(
  {
    companyName: {
      type: String,
      required: true,
    },
    companyTicker: {
      type: String,
      required: true,
    },
    dateOfRecord: {
      type: Date,
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
    transcript: [
      {
        text: {
          type: String,
          required: true,
        },
        processFurther: {
          type: Boolean,
          required: false,
          default: null,
        },
      },
    ],
  },
  schemaOptions,
);
RawTranscriptSchema.index(
  { companyTicker: 1, fiscalYear: 1, fiscalQuarter: 1 },
  { unique: true },
);
export default model<RawTranscriptDoc>("rawTranscript", RawTranscriptSchema);
