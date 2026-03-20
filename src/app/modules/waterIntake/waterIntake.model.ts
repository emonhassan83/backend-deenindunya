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
      min: [50, 'Amount must be at least 50ml'],
      max: [5000, 'Amount cannot exceed 5000ml (5L)'],
    },
    date: {
      type: String,
      required: [true, 'Date is required']
    }
  },
  {
    timestamps: true,
  }
)

// Index for filtering by user and date
waterIntakeSchema.index({ user: 1, date: -1 })


export const WaterIntake = model<TWaterIntake, TWaterIntakeModel>(
  'WaterIntake',
  waterIntakeSchema
)