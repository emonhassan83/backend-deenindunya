import { model, Schema } from 'mongoose'
import { TSubscriptions, TSubscriptionsModel } from './subscription.interface'
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from './subscription.constants'

// Define the Mongoose schema
const subscriptionsSchema = new Schema<TSubscriptions>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    transactionId: { type: String, default: null },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, default: PAYMENT_STATUS.unpaid },
    status: { type: String, default: SUBSCRIPTION_STATUS.pending },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

// filter out subscription
subscriptionsSchema.pre('find', function () {
  this.find({ isDeleted: { $ne: true } })
})

subscriptionsSchema.pre('findOne', function () {
  this.find({ isDeleted: { $ne: true } })
})

subscriptionsSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
})

// Create and export the model
export const Subscription = model<TSubscriptions, TSubscriptionsModel>(
  'Subscription',
  subscriptionsSchema,
)
