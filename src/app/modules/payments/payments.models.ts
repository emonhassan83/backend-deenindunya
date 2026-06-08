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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.unpaid,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    tranId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
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
