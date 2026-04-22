import { Schema, model } from 'mongoose'
import { TReminder, TReminderModel } from './reminders.interface'

const reminderSchema = new Schema<TReminder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    logAt: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // ✅ Auto delete after 7 days
    deleteAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        return date
      },
    },
  },
  { timestamps: true },
)

// ✅ TTL Index - Auto delete after 7 days
reminderSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Performance indexes
reminderSchema.index({ user: 1, logAt: 1 })
reminderSchema.index({ user: 1, isCompleted: 1 })

export const Reminder = model<TReminder, TReminderModel>(
  'Reminder',
  reminderSchema,
)
