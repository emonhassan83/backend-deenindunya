import { Schema, model } from 'mongoose'
import { TPackage, TPackageModel } from './package.interface'
import { durationType } from './package.constant'

const packageSchema = new Schema<TPackage>(
  {
    title: { type: String, required: true },
    billingCycle: {
      type: String,
      enum: Object.values(durationType)
    },
    description: { type: [String], required: true },
    price: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export const Package = model<TPackage, TPackageModel>('Package', packageSchema)
