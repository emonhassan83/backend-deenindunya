import { Schema, model } from 'mongoose'
import { TAmbition, TAmbitionModel } from './ambitions.interface'
import { AmbitionsType } from './ambitions.constant'

const ambitionSchema = new Schema<TAmbition>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: Object.values(AmbitionsType),
      required: [true, 'Ambition type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
)

// Index for search and filtering
ambitionSchema.index({ user: 1, type: 1 })

export const Ambition = model<TAmbition, TAmbitionModel>(
  'Ambition',
  ambitionSchema
)