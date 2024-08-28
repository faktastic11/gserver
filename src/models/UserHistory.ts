import mongoose, { Document, Schema, Types } from "mongoose";

interface UserHistoryDoc extends Document {
  userId: Types.ObjectId;
  searches: string[];
}

const schemaOptions = {
  toJSON: {
    transform: function (_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: {
    transform: function (_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
};

const UserHistorySchema = new Schema<UserHistoryDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    searches: [
      {
        type: String,
        required: true,
        index: true,
      },
    ],
  },
  schemaOptions,
);

export default mongoose.model<UserHistoryDoc>("UserHistory", UserHistorySchema);
