import httpStatus from 'http-status'
import Payment from './payments.models'
import AppError from '../../errors/AppError'
import { PAYMENT_STATUS } from './payments.constants'
import QueryBuilder from '../../builder/QueryBuilder'

const getAllPaymentsFromDB = async (query: Record<string, any>) => {
  const paymentModel = new QueryBuilder(
    Payment.find({ isDeleted: false }).populate([
      { path: 'user', select: 'name email photoUrl' },
      { path: 'subscription', select: 'productId entitlementId status expiresAt' },
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
    Payment.find({ isDeleted: false, status: PAYMENT_STATUS.paid }).populate([
      { path: 'user', select: 'name email photoUrl' },
      { path: 'subscription', select: 'productId entitlementId status expiresAt' },
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
    status: PAYMENT_STATUS.paid,
  })

  const totalEarning = await Payment.aggregate([
    {
      $match: {
        isDeleted: false,
        status: PAYMENT_STATUS.paid,
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
    { path: 'user', select: 'name email photoUrl' },
    { path: 'subscription' },
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

export const paymentsService = {
  dashboardData,
  getAllPaymentsFromDB,
  getAPaymentsFromDB,
  getAPaymentByReferenceIdFromDB,
}
