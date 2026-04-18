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
subscriptionsSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } })
  next()
})

subscriptionsSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } })
  next()
})

subscriptionsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

// Create and export the model
export const Subscription = model<TSubscriptions, TSubscriptionsModel>(
  'Subscription',
  subscriptionsSchema,
)
