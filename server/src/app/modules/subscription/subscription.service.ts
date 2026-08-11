import { Types } from 'mongoose'
import httpStatus from 'http-status'
import QueryBuilder from '../../builder/QueryBuilder'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Subscription } from './subscription.models'
import { SUBSCRIPTION_STATUS } from './subscription.constants'
import {
  findPackageByProduct,
  getActiveEntitlement,
  getRevenueCatSubscriber,
  notifyUserAboutRevenueCatEvent,
  resolveStatus,
  RevenueCatWebhookEvent,
  toDate,
  upsertRevenueCatPayment,
  verifyRevenueCatWebhookSecret,
} from './subscription.utils'

const syncRevenueCatSubscription = async (
  userId: string,
  payload: { revenueCatAppUserId?: string },
) => {
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  const revenueCatAppUserId = payload.revenueCatAppUserId || userId
  const subscriber = await getRevenueCatSubscriber(revenueCatAppUserId)
  if (!subscriber) {
    throw new AppError(httpStatus.NOT_FOUND, 'RevenueCat subscriber not found')
  }

  const activeEntitlement = getActiveEntitlement(subscriber.entitlements || {})
  if (!activeEntitlement) {
    const result = await Subscription.findOneAndUpdate(
      { user: user._id, revenueCatAppUserId },
      {
        user: user._id,
        revenueCatAppUserId,
        status: SUBSCRIPTION_STATUS.expired,
        willRenew: false,
        rawEventData: subscriber,
      },
      { new: true, upsert: true },
    )

    return { isActiveSubscription: false, subscription: result }
  }

  const [entitlementId, entitlement] = activeEntitlement
  const productId = entitlement.product_identifier
  const expiresAt = toDate(entitlement.expires_date)
  const packages = await findPackageByProduct(productId)

  const result = await Subscription.findOneAndUpdate(
    {
      user: user._id,
      revenueCatAppUserId,
      entitlementId,
    },
    {
      user: user._id,
      package: packages?._id,
      revenueCatAppUserId,
      productId,
      entitlementId,
      status: resolveStatus(undefined, expiresAt),
      currentPeriodStartsAt: toDate(entitlement.purchase_date),
      currentPeriodEndsAt: expiresAt,
      expiresAt,
      willRenew: true,
      rawEventData: subscriber,
    },
    { new: true, upsert: true },
  )

  return {
    isActiveSubscription: result.status === SUBSCRIPTION_STATUS.active,
    subscription: result,
  }
}

const handleRevenueCatWebhook = async (
  payload: { event?: RevenueCatWebhookEvent },
  headers: { authorization?: string; webhookSecret?: string | string[] },
) => {
  verifyRevenueCatWebhookSecret(headers.authorization, headers.webhookSecret)

  const event = payload.event
  if (!event || !event.app_user_id || !event.type) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid RevenueCat webhook payload')
  }

  let user = Types.ObjectId.isValid(event.app_user_id)
    ? await User.findById(event.app_user_id)
    : null

  let existingSubscription = await Subscription.findOne({
    revenueCatAppUserId: event.app_user_id,
  })

  if (!user && existingSubscription) {
    user = await User.findById(existingSubscription.user)
  }

  if (!user || user.isDeleted) {
    return {
      success: false,
      message: 'RevenueCat user is not linked with a local account',
    }
  }

  const expiresAt = toDate(event.expiration_at_ms)
  const purchasedAt = toDate(event.purchased_at_ms)
  const productId = event.product_id
  const entitlementId = event.entitlement_id || event.entitlement_ids?.[0]
  const packages = await findPackageByProduct(productId)
  const status = resolveStatus(event.type, expiresAt)
  const originalTransactionId =
    event.original_transaction_id || event.transaction_id || event.id || null

  const subscription = await Subscription.findOneAndUpdate(
    {
      $or: [
        ...(originalTransactionId
          ? [{ revenueCatOriginalTransactionId: originalTransactionId }]
          : []),
        ...(existingSubscription ? [{ _id: existingSubscription._id }] : []),
        {
          user: user._id,
          revenueCatAppUserId: event.app_user_id,
          productId,
        },
      ],
    },
    {
      user: user._id,
      package: packages?._id,
      revenueCatAppUserId: event.app_user_id,
      revenueCatOriginalTransactionId: originalTransactionId,
      revenueCatTransactionId: event.transaction_id,
      revenueCatEventId: event.id,
      productId,
      entitlementId,
      store: event.store,
      status,
      currentPeriodStartsAt: purchasedAt,
      currentPeriodEndsAt: expiresAt,
      cancelledAt:
        event.type === 'CANCELLATION' || event.type === 'REFUND'
          ? toDate(event.event_timestamp_ms)
          : null,
      expiresAt,
      willRenew: !['CANCELLATION', 'EXPIRATION', 'REFUND'].includes(event.type),
      rawEventData: event as Record<string, unknown>,
    },
    { new: true, upsert: true },
  )

  await upsertRevenueCatPayment(event, subscription._id, user._id)
  await notifyUserAboutRevenueCatEvent(user, event, subscription._id, expiresAt)

  return { success: true, eventType: event.type, subscription }
}

const getAllSubscription = async (query: Record<string, any>) => {
  const subscriptionsModel = new QueryBuilder(
    Subscription.find().populate([
      {
        path: 'package',
        select: 'title billingCycle revenueCatProductId entitlementId price',
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
  if (!result) {
    throw new Error('Subscription not found')
  }

  return result
}

export const subscriptionService = {
  syncRevenueCatSubscription,
  handleRevenueCatWebhook,
  getAllSubscription,
  getSubscriptionById,
}
