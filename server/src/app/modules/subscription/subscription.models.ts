import { model, Schema } from 'mongoose'
import { TSubscriptions, TSubscriptionsModel } from './subscription.interface'
import { SUBSCRIPTION_STATUS } from './subscription.constants'

const subscriptionsSchema = new Schema<TSubscriptions>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    package: { type: Schema.Types.ObjectId, ref: 'Package' },
    revenueCatAppUserId: { type: String, required: true, index: true },
    revenueCatOriginalTransactionId: { type: String },
    revenueCatTransactionId: { type: String, default: null, index: true },
    revenueCatEventId: { type: String, unique: true, sparse: true },
    productId: { type: String, default: null, index: true },
    entitlementId: { type: String, default: null, index: true },
    store: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.active,
      index: true,
    },
    currentPeriodStartsAt: { type: Date, default: null },
    currentPeriodEndsAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    willRenew: { type: Boolean, default: true },
    rawEventData: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
)

subscriptionsSchema.index({ user: 1, status: 1, expiresAt: 1 })
subscriptionsSchema.index(
  { revenueCatOriginalTransactionId: 1 },
  { unique: true, sparse: true },
)

// Create and export the model
export const Subscription = model<TSubscriptions, TSubscriptionsModel>(
  'Subscription',
  subscriptionsSchema,
)
