import { Schema, model } from 'mongoose'
import {
  TSunnah,
  TSunnaMemorizedLog,
  TSunnaMemorizedLogModel,
  TSunnahModel,
} from './sunnah.interface'

const sunnahSchema = new Schema<TSunnah>(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    arabicText: {
      type: String,
      trim: true,
    },
    transliteration: {
      type: String,
      trim: true,
    },
    translation: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    howToPractise: {
      type: String,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Ensure howToPractise and explanation stay in sync
sunnahSchema.pre('save', function () {
  if (this.howToPractise && !this.explanation) {
    this.explanation = this.howToPractise
  } else if (this.explanation && !this.howToPractise) {
    this.howToPractise = this.explanation
  }
})

const sunnaMemorizedLogSchema = new Schema<TSunnaMemorizedLog>(
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
  },
  { timestamps: true },
)

// Compound index to ensure uniqueness per user per sunnah
sunnaMemorizedLogSchema.index({ sunnah: 1, user: 1 }, { unique: true })
sunnaMemorizedLogSchema.index({ user: 1 })

export const Sunnah = model<TSunnah, TSunnahModel>('Sunnah', sunnahSchema)
export const SunnaMemorizedLog = model<
  TSunnaMemorizedLog,
  TSunnaMemorizedLogModel
>('SunnaMemorizedLog', sunnaMemorizedLogSchema)

// Backward-compatibility alias
export const SunnahLog = SunnaMemorizedLog
