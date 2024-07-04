import { Document, Schema, Types, model } from 'mongoose'

// base interfaces used for creating documents with strong typing
export interface CompanyType {
  companyName: string
  companyTicker: string
  description: string
  gics: {
    sector: string
    subIndustry: string
  }
}

export interface CompanyDoc extends Document, CompanyType {
  industries: Types.Array<string>
}

const schemaOptions = {
  collection: 'companies',
  timestamps: true,
}

const CompanySchema = new Schema<CompanyDoc>(
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
    gics: {
      sector: { type: String, required: false },
      subIndustry: { type: String, required: false },
    },
    description: {
      type: String,
      required: false,
    },
  },
  schemaOptions,
)

export default model<CompanyDoc>('Company', CompanySchema)
