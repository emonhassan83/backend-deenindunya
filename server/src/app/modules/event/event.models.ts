import { Schema, model } from 'mongoose'
import { TEvent, TEventModel } from './event.interface'
import { EVENT_TYPE } from './event.constants'

const eventSchema = new Schema<TEvent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(EVENT_TYPE),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

// ✅ এই index থাকলে same title + date + type কখনো duplicate হবে না
eventSchema.index({ type: 1, title: 1, date: 1 }, { unique: true })

export const Event = model<TEvent, TEventModel>('Event', eventSchema)
