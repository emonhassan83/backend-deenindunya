import Stripe from 'stripe'
import config from '../../config'
import { TPayment } from './payments.interface'
import httpStatus from 'http-status'
import Payment from './payments.models'
import mongoose, { startSession } from 'mongoose'
import { Subscription } from '../subscription/subscription.models'
import AppError from '../../errors/AppError'
import {
  createCheckoutSession,
  paymentNotifyToAdmin,
  paymentNotifyToUser,
} from './payments.utils'
import { generateTransactionId } from '../../utils/generateTransctionId'
import { PAYMENT_STATUS } from './payments.constants'
import QueryBuilder from '../../builder/QueryBuilder'
import { User } from '../user/user.model'
import { Package } from '../package/package.model'

const stripe = new Stripe(config.stripe?.stripe_api_secret as string, {
  apiVersion: '2026-06-24.dahlia',
  typescript: true,
})

const checkout = async (payload: TPayment) => {
  const { user: userId, subscription: subscriptionId } = payload

  // Validate user
  const user = await User.findById(userId).lean()
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found or deleted')
  }

  // Validate subscription
  const subscription = await Subscription.findById(subscriptionId)
    .populate('package')
    .lean()

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found')
  }

  const tranId = generateTransactionId()

  let paymentData: TPayment

  const isExistPayment: TPayment | null = await Payment.findOne({
    subscription: payload?.subscription,
    isPaid: false,
    user: payload?.user,
  })

  if (isExistPayment) {
    const payment = await Payment.findByIdAndUpdate(
      isExistPayment?._id,
      { tranId },
      { new: true },
    )

    paymentData = payment as TPayment
  } else {
    payload.tranId = tranId
    payload.amount = subscription?.amount

    const createdPayment = await Payment.create(payload)
    if (!createdPayment) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create payment',
      )
    }
    paymentData = createdPayment
  }

  if (!paymentData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment not found!')
  }

  const checkoutSession = await createCheckoutSession({
    product: {
      amount: paymentData?.amount,
      //@ts-ignore
      name: subscription?.package?.title,
      quantity: 1,
    },
    customer: {
      name: user.name,
      email: user.email,
    },
    paymentId: paymentData._id!,
  })

  return checkoutSession?.url
}

const confirmPayment = async (query: Record<string, any>) => {
  const { sessionId, paymentId } = query

  const session = await startSession()
  const PaymentSession = await stripe.checkout.sessions.retrieve(sessionId)
  const paymentIntentId = PaymentSession.payment_intent as string

  if (PaymentSession.status !== 'complete') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment session is not completed',
    )
  }

  try {
    session.startTransaction()
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        isPaid: true,
        status: PAYMENT_STATUS.paid,
        paymentIntentId: paymentIntentId,
      },
      { new: true, session },
    )

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment Not Found!')
    }

    const newSubscription = await Subscription.findOneAndUpdate(
      payment.subscription,
      {
        transactionId: payment.tranId,
        paymentStatus: PAYMENT_STATUS.paid,
        status: 'confirmed',
      },
      { returnDocument: 'after', session },
    )

    if (!newSubscription) {
      throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found!')
    }

    // find user to convert premium account
    await User.findByIdAndUpdate(
      { _id: payment.user },
      { $set: { isPremiumAccount: true } },
      { new: true, session },
    )

    // Increase the package popularity
    await Package.findByIdAndUpdate(
      newSubscription.package,
      { $inc: { popularity: 1 } },
      { new: true, session },
    )

    // sent notify to user when payment is success
    await paymentNotifyToUser('SUCCESS', payment)

    // sent notify to admin when payment is success
    await paymentNotifyToAdmin('SUCCESS', payment)

    await session.commitTransaction()
    return payment
  } catch (error: any) {
    await session.abortTransaction()
    if (paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
        })
      } catch (refundError: any) {
        console.error('Error processing refund:', refundError.message)
      }
    }
    throw new AppError(httpStatus.BAD_GATEWAY, error.message)
  } finally {
    session.endSession()
  }
}

const getAllPaymentsFromDB = async (query: Record<string, any>) => {
  const paymentModel = new QueryBuilder(
    Payment.find({ isDeleted: false, isPaid: true }).populate([
      { path: 'subscription' },
      { path: 'user', select: 'name email photoUrl' },
    ]),
    query,
  )
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await paymentModel.modelQuery
  const meta = await paymentModel.countTotal()

  return {
    data,
    meta,
  }
}

const dashboardData = async (query: Record<string, any>) => {
  const paymentModel = new QueryBuilder(
    Payment.find({ isDeleted: false, isPaid: true }).populate([
      { path: 'subscription', select: 'user status paymentStatus' },
      { path: 'user', select: 'name email photoUrl' },
    ]),
    query,
  )
    .search(['']) // You can remove or fill this based on your requirements
    .filter()
    .paginate()
    .sort()
    .fields()

  const earningList = await paymentModel.modelQuery
  const subscriptionPurchased = await Payment.countDocuments({
    isDeleted: false,
    isPaid: true,
  })

  const totalEarning = await Payment.aggregate([
    {
      $match: {
        isDeleted: false,
        isPaid: true,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ])

  return {
    data: {
      totalEarning: totalEarning[0]?.total || 0,
      subscriptionPurchased,
      earningList,
    },
    meta: await paymentModel.countTotal(),
  }
}

const getAPaymentsFromDB = async (id: string) => {
  const payment = await Payment.findById(id).populate([
    { path: 'subscription' },
    { path: 'user', select: 'name email photoUrl' },
  ])
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found!')
  }

  return payment
}

const getAPaymentByReferenceIdFromDB = async (referenceId: string) => {
  const payment = await Payment.findOne({ subscription: referenceId }).populate(
    [{ path: 'subscription' }, { path: 'user', select: 'name email photoUrl' }],
  )
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found!')
  }

  return payment
}

const refundPayment = async (payload: any) => {
  if (!payload?.intendId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment intent ID is required')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const refundData = {
      payment_intent: payload.intendId,
      ...(payload.amount && {
        amount: payload.amount * 100,
        reason: 'requested_by_customer',
      }),
    }

    const paymentData = await Payment.findOneAndUpdate(
      { paymentIntentId: payload.intendId },
      { session },
    )

    // update subscription  status
    await Subscription.findOneAndUpdate(
      paymentData?.subscription,
      {
        paymentStatus: PAYMENT_STATUS.refunded,
        status: 'cancelled',
      },
      { session },
    )

    // Find and update payment status
    const payment = await Payment.findOneAndUpdate(
      { paymentIntentId: payload.intendId },
      { status: PAYMENT_STATUS.refunded, isPaid: false },
      { returnDocument: 'after', session },
    )

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment record not updated')
    }

    // Process refund via Stripe
    const response = await stripe.refunds.create(refundData)

    // sent notify to user when payment is refund
    await paymentNotifyToUser('REFUND', payment)

    // sent notify to admin when payment is refund
    await paymentNotifyToAdmin('REFUND', payment)

    // Commit transaction
    await session.commitTransaction()
    session.endSession()

    return response
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    console.error('Refund Error:', error)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.message || 'Refund processing failed',
    )
  }
}

export const paymentsService = {
  checkout,
  confirmPayment,
  dashboardData,
  getAllPaymentsFromDB,
  getAPaymentsFromDB,
  getAPaymentByReferenceIdFromDB,
  refundPayment,
}
