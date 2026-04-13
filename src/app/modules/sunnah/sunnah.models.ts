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
      type: String
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
  },
  { timestamps: true },
)

export const Sunnah = model<TSunnah, TSunnahModel>('Sunnah', sunnahSchema)
export const SunnahLog = model<TSunnahLog, TSunnahLogModel>(
  'SunnahLog',
  sunnahLogsSchema,
)
