import { Schema, model } from 'mongoose'
import { TContents, TContentsModel } from './contents.interface'

const contentsSchema = new Schema<TContents>(
  {
    termsAndConditions: {
      type: String,
    },
    privacyPolicy: {
      type: String,
    },
    waterIntake: {
      type: [String],
      default: [],
    }
  },
  {
    timestamps: true,
  },
)

export const Contents = model<TContents, TContentsModel>(
  'Contents',
  contentsSchema,
)
