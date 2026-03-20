import { Schema, model } from 'mongoose'
import { TMoodLogs, TMoodLogsModel } from './moodLogs.interface'

const moodLogsSchema = new Schema<TMoodLogs>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      trim: true,
    },
    logDate: {
      type: String,
      required: [true, 'Log date is required'],
    },
  },
  {
    timestamps: true,
  }
)

// Compound index: one mood log per user per day
moodLogsSchema.index({ user: 1, logDate: 1 })

export const MoodLog = model<TMoodLogs, TMoodLogsModel>(
  'MoodLog',
  moodLogsSchema
)
