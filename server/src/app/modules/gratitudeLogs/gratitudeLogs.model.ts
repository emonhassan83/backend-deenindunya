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
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    logAt: {
      type: String,
      required: [true, 'Log date is required'],
    },
    // ✅ Auto-delete after 30 days
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

// TTL index: MongoDB automatically deletes documents when deleteAt is reached
gratitudeLogsSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Pre-save middleware to set deleteAt to 30 days from now if not provided
gratitudeLogsSchema.pre('save', function () {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    this.deleteAt = date
  }
})

// Index for filtering and search
gratitudeLogsSchema.index({ user: 1, type: 1, createdAt: -1 })

export const GratitudeLog = model<TGratitudeLogs, TGratitudeLogsModel>(
  'GratitudeLog',
  gratitudeLogsSchema,
)
