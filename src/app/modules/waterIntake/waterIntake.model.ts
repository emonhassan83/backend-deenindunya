import { Schema, model } from 'mongoose'
import { TWaterIntake, TWaterIntakeModel } from './waterIntake.interface'

const waterIntakeSchema = new Schema<TWaterIntake>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    amountMl: {
      type: Number,
      required: [true, 'Water amount is required'],
      min: [250, 'Amount must be at least 250ml'],
      max: [5000, 'Amount cannot exceed 5000ml (5L)'],
    },
    logAt: {
      type: String,
      required: [true, 'Log date is required'],
    },
    // ✅ Auto-delete after 7 days
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
  {
    timestamps: true,
  },
)

// TTL Index: MongoDB automatically deletes the document when deleteAt is reached
waterIntakeSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Pre-save middleware: set deleteAt to 7 days from now if not provided
waterIntakeSchema.pre('save', function () {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    this.deleteAt = date
  }
})

// Index for filtering by user and date
waterIntakeSchema.index({ user: 1, logAt: -1 })

export const WaterIntake = model<TWaterIntake, TWaterIntakeModel>(
  'WaterIntake',
  waterIntakeSchema,
)
