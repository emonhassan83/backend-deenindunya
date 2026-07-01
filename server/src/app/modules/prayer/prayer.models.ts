import { Schema, model } from 'mongoose'
import { TPrayer, TPrayerModel } from './prayer.interface'
import { PRAYER_NAME } from './prayer.constants'

const prayerSchema = new Schema<TPrayer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      enum: Object.values(PRAYER_NAME),
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    prayed: {
      type: Boolean,
      default: false,
    },
    prayedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Compound index to prevent duplicate prayers
prayerSchema.index({ user: 1, name: 1, date: 1 }, { unique: true })

// Index for efficient querying
prayerSchema.index({ user: 1, date: 1 })
prayerSchema.index({ user: 1, prayed: 1 })

export const Prayer = model<TPrayer, TPrayerModel>('Prayer', prayerSchema)