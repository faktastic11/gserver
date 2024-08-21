import bcrypt from 'bcrypt'
import mongoose, { Document, Schema } from 'mongoose'

interface UserDoc extends Document {
  name: string
  email: string
  password: string
}

const schemaOptions = {
  toJSON: {
    transform(doc, ret) {
      delete ret.password
      return ret
    },
  },
  toObject: {
    transform(doc, ret) {
      delete ret.password
      return ret
    },
  },
}

const UserSchema = new Schema<UserDoc>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  schemaOptions,
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

UserSchema.methods.getUserWithPassword = function () {
  return this.model('User').findOne({ _id: this._id }).select('+password')
}

export default mongoose.model<UserDoc>('User', UserSchema)
