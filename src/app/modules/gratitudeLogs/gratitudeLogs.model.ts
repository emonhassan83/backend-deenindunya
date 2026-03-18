import { Schema, model } from 'mongoose'
import { TGratitudeLogs, TGratitudeLogsModel } from './gratitudeLogs.interface'
import { GratitudeType } from './gratitudeLogs.constant'

const gratitudeLogsSchema = new Schema<TGratitudeLogs>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: Object.values(GratitudeType),
      required: [true, 'Gratitude type is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for filtering and search
gratitudeLogsSchema.index({ user: 1, type: 1, createdAt: -1 })

export const GratitudeLog = model<TGratitudeLogs, TGratitudeLogsModel>(
  'GratitudeLog',
  gratitudeLogsSchema
)