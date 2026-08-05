import mongoose from 'mongoose'
import httpStatus from 'http-status'
import QueryBuilder from '../../builder/QueryBuilder'
import { TSubscriptions } from './subscription.interface'
import { Package } from '../package/package.model'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Subscription } from './subscription.models'
import {
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  TSubscriptionStatus,
} from './subscription.constants'

const createSubscription = async (payload: TSubscriptions) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Check if an unpaid subscription already exists for the user and package
    const isExist = await Subscription.findOne({
      user: payload.user,
      // package: payload.package,
      paymentStatus: PAYMENT_STATUS.unpaid,
      status: SUBSCRIPTION_STATUS.pending,
    }).session(session)

    if (isExist) {
      return isExist
    }

    //  Find the user in the database
    const user = await User.findById(payload.user).session(session)
    if (!user || user.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
    }

    // Find the package in the database
    const packages = await Package.findById(payload.package).session(session)
    if (!packages || packages.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Package not found')
    }

    // set full amount
    payload.amount = packages.price

    // Create a new subscription record in the database
    const result = await Subscription.create([payload], { session })
    if (!result || result.length === 0) {
      throw new Error('Failed to create subscription')
    }

    // Commit the transaction if everything is successful
    await session.commitTransaction()
    session.endSession()

    return result[0]
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

const getAllSubscription = async (query: Record<string, any>) => {
  const subscriptionsModel = new QueryBuilder(
    Subscription.find({
      paymentStatus: PAYMENT_STATUS.paid,
      isDeleted: false,
    }).populate([
      {
        path: 'package',
        select: 'title billingCycle',
      },
      {
        path: 'user',
        select: 'name email photoUrl',
      },
    ]),
    query,
  )
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await subscriptionsModel.modelQuery
  const meta = await subscriptionsModel.countTotal()
  return {
    data,
    meta,
  }
}

const getSubscriptionById = async (id: string) => {
  const result = await Subscription.findById(id).populate([
    {
      path: 'package',
      select: '',
    },
    {
      path: 'user',
      select: 'name email photoUrl',
    },
  ])
  if (!result || result?.isDeleted) {
    throw new Error('Subscription not found')
  }

  return result
}

const updateSubscription = async (
  id: string,
  payload: { status: TSubscriptionStatus },
) => {
  const { status } = payload

  const subscription = await Subscription.findById(id)
  if (!subscription || subscription?.isDeleted) {
    throw new Error('Failed to update subscription')
  }

  const result = await Subscription.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
    },
  )
  if (!result) {
    throw new Error('Failed to update subscription')
  }

  return result
}

export const subscriptionService = {
  createSubscription,
  getAllSubscription,
  getSubscriptionById,
  updateSubscription,
}
