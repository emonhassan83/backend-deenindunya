import { Schema, model } from 'mongoose'
import { TPackage, TPackageModel } from './package.interface'
import { durationType } from './package.constant'

const packageSchema = new Schema<TPackage>(
  {
    title: { type: String, required: true },
    billingCycle: {
      type: String,
      enum: Object.values(durationType),
      required: true,
    },
    revenueCatProductId: { type: String, trim: true, unique: true, sparse: true },
    entitlementId: { type: String, trim: true },
    description: { type: [String], required: true },
    price: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export const Package = model<TPackage, TPackageModel>('Package', packageSchema)
