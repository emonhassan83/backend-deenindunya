import axios from 'axios'
import { Types } from 'mongoose'
import httpStatus from 'http-status'
import QueryBuilder from '../../builder/QueryBuilder'
import { Package } from '../package/package.model'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Subscription } from './subscription.models'
import { SUBSCRIPTION_STATUS, TSubscriptionStatus } from './subscription.constants'
import config from '../../config'
import Payment from '../payments/payments.models'
import { PAYMENT_STATUS } from '../payments/payments.constants'

type RevenueCatEntitlement = {
  expires_date?: string | null
  product_identifier?: string | null
  purchase_date?: string | null
}

type RevenueCatWebhookEvent = {
  id?: string
  type?: string
  app_user_id?: string
  product_id?: string
  entitlement_id?: string
  entitlement_ids?: string[]
  transaction_id?: string
  original_transaction_id?: string
  store?: string
  price?: number
  price_in_purchased_currency?: number
  currency?: string
  purchased_at_ms?: number
  expiration_at_ms?: number
  event_timestamp_ms?: number
  auto_resume_at_ms?: number
}

const revenueCatApiBaseUrl = 'https://api.revenuecat.com/v1'

const toDate = (value?: string | number | null) => {
  if (!value) return null
  const date = typeof value === 'number' ? new Date(value) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const resolveStatus = (
  eventType?: string,
  expiresAt?: Date | null,
): TSubscriptionStatus => {
  if (eventType === 'EXPIRATION') return 'expired'
  if (eventType === 'REFUND') return 'cancelled'
  if (eventType === 'BILLING_ISSUE') return 'billing_issue'
  if (eventType === 'CANCELLATION') return 'cancelled'

  if (expiresAt && expiresAt <= new Date()) return 'expired'
  return 'active'
}

const getRevenueCatHeaders = () => {
  if (!config.revenueCat.apiKey) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'RevenueCat API key is not configured',
    )
  }

  return {
    Authorization: `Bearer ${config.revenueCat.apiKey}`,
  }
}

const verifyRevenueCatWebhookSecret = (
  authorization?: string,
  webhookSecret?: string | string[],
) => {
  const secret = config.revenueCat.webhookSecret
  if (!secret) return

  const candidate = Array.isArray(webhookSecret)
    ? webhookSecret[0]
    : webhookSecret
  const normalizedAuth = authorization?.replace(/^Bearer\s+/i, '')

  if (candidate === secret || normalizedAuth === secret || authorization === secret) {
    return
  }

  throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid RevenueCat webhook secret')
}

const findPackageByProduct = async (productId?: string | null) => {
  if (!productId) return null

  return Package.findOne({
    revenueCatProductId: productId,
    isDeleted: false,
  }).select('_id price revenueCatProductId entitlementId billingCycle')
}

const getRevenueCatSubscriber = async (revenueCatAppUserId: string) => {
  const { data } = await axios.get(
    `${revenueCatApiBaseUrl}/subscribers/${encodeURIComponent(
      revenueCatAppUserId,
    )}`,
    { headers: getRevenueCatHeaders() },
  )

  return data?.subscriber
}

const getActiveEntitlement = (entitlements: Record<string, RevenueCatEntitlement>) => {
  const now = new Date()
  const entries = Object.entries(entitlements || {})

  return entries.find(([, entitlement]) => {
    const expiresAt = toDate(entitlement.expires_date)
    return !expiresAt || expiresAt > now
  })
}

const upsertRevenueCatPayment = async (
  event: RevenueCatWebhookEvent,
  subscriptionId: Types.ObjectId,
  userId: Types.ObjectId,
) => {
  const transactionId = event.transaction_id || event.id
  if (!transactionId) return null

  const amount = event.price_in_purchased_currency ?? event.price ?? 0
  const eventType = event.type
  const status =
    eventType === 'REFUND'
      ? PAYMENT_STATUS.refunded
      : eventType === 'BILLING_ISSUE'
        ? PAYMENT_STATUS.failed
        : ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE'].includes(
              eventType || '',
            )
          ? PAYMENT_STATUS.paid
          : PAYMENT_STATUS.unpaid

  return Payment.findOneAndUpdate(
    {
      $or: [
        ...(event.id ? [{ revenueCatEventId: event.id }] : []),
        { revenueCatTransactionId: transactionId },
      ],
    },
    {
      user: userId,
      subscription: subscriptionId,
      revenueCatEventId: event.id || transactionId,
      revenueCatEventType: eventType,
      revenueCatProductId: event.product_id,
      revenueCatTransactionId: transactionId,
      revenueCatOriginalTransactionId: event.original_transaction_id,
      entitlementId: event.entitlement_id || event.entitlement_ids?.[0],
      amount,
      currency: event.currency || 'USD',
      status,
      purchasedAt: toDate(event.purchased_at_ms || event.event_timestamp_ms),
      rawEventData: event as Record<string, unknown>,
      isDeleted: false,
    },
    { new: true, upsert: true },
  )
}

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
        isDeleted: false,
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
      isDeleted: false,
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
      isDeleted: false,
    },
    { new: true, upsert: true },
  )

  await upsertRevenueCatPayment(event, subscription._id, user._id)

  return { success: true, eventType: event.type, subscription }
}

const getAllSubscription = async (query: Record<string, any>) => {
  const subscriptionsModel = new QueryBuilder(
    Subscription.find({
      isDeleted: false,
    }).populate([
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
  syncRevenueCatSubscription,
  handleRevenueCatWebhook,
  getAllSubscription,
  getSubscriptionById,
  updateSubscription,
}
