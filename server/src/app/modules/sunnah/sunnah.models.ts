import { Schema, model } from 'mongoose'
import {
  TSunnah,
  TSunnahLog,
  TSunnahLogModel,
  TSunnahModel,
} from './sunnah.interface'

const sunnahSchema = new Schema<TSunnah>(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    arabicText: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const sunnahLogsSchema = new Schema<TSunnahLog>(
  {
    sunnah: {
      type: Schema.Types.ObjectId,
      ref: 'Sunnah',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: {
      type: String,
      required: true,
    },

    // ✅ Auto delete after 365 days
    deleteAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 365)
        return date
      },
    },
  },
  { timestamps: true },
)

// expireAfterSeconds: 0 means delete exactly at the deleteAt time
sunnahLogsSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Pre-save middleware to ensure deleteAt is set (if not provided)
sunnahLogsSchema.pre('save', function () {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 365)
    this.deleteAt = date
  }
})

// Optional: Index for faster queries
sunnahLogsSchema.index({ user: 1, completedAt: -1 })
sunnahLogsSchema.index({ sunnah: 1, user: 1 })

export const Sunnah = model<TSunnah, TSunnahModel>('Sunnah', sunnahSchema)
export const SunnahLog = model<TSunnahLog, TSunnahLogModel>(
  'SunnahLog',
  sunnahLogsSchema,
)
