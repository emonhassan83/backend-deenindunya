import { model, Schema } from 'mongoose'
import { TPayment, TPaymentModel } from './payments.interface'
import { PAYMENT_STATUS } from './payments.constants'

// Define the Mongoose schema
const PaymentSchema = new Schema<TPayment>(
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
PaymentSchema.pre('find', function (next) {
  //@ts-ignore
  this.find({ isDeleted: { $ne: true } })
  next()
})

PaymentSchema.pre('findOne', function (next) {
  //@ts-ignore
  this.find({ isDeleted: { $ne: true } })
  next()
})

PaymentSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})
// Create and export the model
const Payment = model<TPayment, TPaymentModel>('Payment', PaymentSchema)

export default Payment
