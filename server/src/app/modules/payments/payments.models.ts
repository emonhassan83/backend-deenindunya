import { model, Schema } from 'mongoose'
import { TPayment, TPaymentModel } from './payments.interface'
import { PAYMENT_STATUS } from './payments.constants'

// Define the Mongoose schema
const paymentSchema = new Schema<TPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    revenueCatEventId: { type: String, unique: true, sparse: true },
    revenueCatEventType: { type: String, default: null, index: true },
    revenueCatProductId: { type: String, default: null, index: true },
    revenueCatTransactionId: { type: String },
    revenueCatOriginalTransactionId: { type: String, default: null, index: true },
    entitlementId: { type: String, default: null },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.unpaid,
    },
    purchasedAt: { type: Date, default: null },
    rawEventData: { type: Schema.Types.Mixed },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

paymentSchema.index({ user: 1, purchasedAt: -1 })
paymentSchema.index(
  { revenueCatTransactionId: 1 },
  { unique: true, sparse: true },
)

// filter out payment data
paymentSchema.pre('find', function () {
  this.find({ isDeleted: { $ne: true } })
})

paymentSchema.pre('findOne', function () {
  this.find({ isDeleted: { $ne: true } })
})

paymentSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
})

// Create and export the model
const Payment = model<TPayment, TPaymentModel>('Payment', paymentSchema)

export default Payment
