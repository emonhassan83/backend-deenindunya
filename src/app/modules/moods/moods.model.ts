import { Schema, model } from 'mongoose'
import { TMood, TMoodLogs, TMoodLogsModel, TMoodModel } from './moods.interface'

const moodSchema = new Schema<TMood>(
  {
    title: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const moodLogsSchema = new Schema<TMoodLogs>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    mood: {
      type: Schema.Types.ObjectId,
      ref: 'Mood',
      required: [true, 'Mood is required'],
    },
    logAt: {
      type: String,
      required: [true, 'Log date is required'],
    },
  },
  {
    timestamps: true,
  }
)

// Compound index: one mood log per user per day
moodLogsSchema.index({ user: 1, logAt: 1 })

export const Mood = model<TMoodLogs, TMoodModel>('Mood', moodSchema)
export const MoodLog = model<TMoodLogs, TMoodLogsModel>('MoodLog', moodLogsSchema)
