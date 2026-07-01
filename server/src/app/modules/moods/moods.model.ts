import { Schema, model } from 'mongoose'
import { TMood, TMoodLogs, TMoodLogsModel, TMoodModel } from './moods.interface'

const moodSchema = new Schema<TMood>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
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
  },
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
    // Auto-delete after 30 days
    deleteAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 30)
        return date
      },
    },
  },
  {
    timestamps: true,
  },
)

// TTL Index: MongoDB will automatically delete documents when deleteAt is reached
moodLogsSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Pre-save middleware to ensure deleteAt is set (if not provided)
moodLogsSchema.pre('save', function () {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 30) // 30 days auto-delete
    this.deleteAt = date
  }
})

// Compound index: one mood log per user per day
moodLogsSchema.index({ user: 1, logAt: 1 })

export const Mood = model<TMoodLogs, TMoodModel>('Mood', moodSchema)
export const MoodLog = model<TMoodLogs, TMoodLogsModel>(
  'MoodLog',
  moodLogsSchema,
)
