import { Schema, model, Document } from "mongoose";

interface Metric {
  earningReport: string;
  excerpt: string;
  high: string;
  low: string;
  similarity: number;
  source: string;
  unit: string;
}

interface LineItem {
  lineItem: string;
  metrics: Metric[];
}

interface GuidanceRevisionsDoc extends Document {
  companyTicker: string;
  fiscalYear: number;
  metricType: string;
  metrics: LineItem[];
}

const MetricSchema = new Schema<Metric>({
  earningReport: String,
  excerpt: String,
  high: String,
  low: String,
  similarity: Number,
  source: String,
  unit: String,
});

const LineItemSchema = new Schema<LineItem>({
  lineItem: String,
  metrics: [MetricSchema],
});

const GuidanceRevisionsSchema = new Schema<GuidanceRevisionsDoc>(
  {
    companyTicker: String,
    fiscalYear: Number,
    metricType: String,
    metrics: [LineItemSchema],
  },
  {
    collection: "guidanceRevisions",
  },
);

export default model<GuidanceRevisionsDoc>(
  "guidanceRevisions",
  GuidanceRevisionsSchema,
);
