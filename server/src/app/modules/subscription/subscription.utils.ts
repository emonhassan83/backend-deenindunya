import axios from 'axios'
import { Types } from 'mongoose'
import httpStatus from 'http-status'
import config from '../../config'
import AppError from '../../errors/AppError'
import { getEmailQueue } from '../../queues/queues'
import { modeType } from '../notification/notification.interface'
import { NotificationService } from '../notification/notification.service'
import { Package } from '../package/package.model'
import { PAYMENT_STATUS } from '../payments/payments.constants'
import Payment from '../payments/payments.models'
import { TSubscriptionStatus } from './subscription.constants'

export type RevenueCatEntitlement = {
  expires_date?: string | null
  product_identifier?: string | null
  purchase_date?: string | null
}

export type RevenueCatWebhookEvent = {
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

export const toDate = (value?: string | number | null) => {
  if (!value) return null
  const date = typeof value === 'number' ? new Date(value) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const resolveStatus = (
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

export const verifyRevenueCatWebhookSecret = (
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

export const findPackageByProduct = async (productId?: string | null) => {
  if (!productId) return null

  return Package.findOne({
    revenueCatProductId: productId,
    isDeleted: false,
  }).select('_id price revenueCatProductId entitlementId billingCycle')
}

export const getRevenueCatSubscriber = async (revenueCatAppUserId: string) => {
  const { data } = await axios.get(
    `${revenueCatApiBaseUrl}/subscribers/${encodeURIComponent(
      revenueCatAppUserId,
    )}`,
    { headers: getRevenueCatHeaders() },
  )

  return data?.subscriber
}

export const getActiveEntitlement = (
  entitlements: Record<string, RevenueCatEntitlement>,
) => {
  const now = new Date()
  const entries = Object.entries(entitlements || {})

  return entries.find(([, entitlement]) => {
    const expiresAt = toDate(entitlement.expires_date)
    return !expiresAt || expiresAt > now
  })
}

const getFormattedDate = (date?: Date | null) => {
  if (!date) return 'not available'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getSubscriptionEventContent = (
  eventType?: string,
  productId?: string | null,
  expiresAt?: Date | null,
) => {
  const productName = productId || 'your subscription'
  const expiryText = getFormattedDate(expiresAt)

  switch (eventType) {
    case 'INITIAL_PURCHASE':
      return {
        subject: 'Subscription Activated',
        title: 'Subscription Activated',
        description: `Your ${productName} subscription is active until ${expiryText}.`,
      }
    case 'RENEWAL':
      return {
        subject: 'Subscription Renewed',
        title: 'Subscription Renewed',
        description: `Your ${productName} subscription has been renewed until ${expiryText}.`,
      }
    case 'PRODUCT_CHANGE':
      return {
        subject: 'Subscription Plan Updated',
        title: 'Subscription Plan Updated',
        description: `Your subscription plan changed to ${productName}. Current access is valid until ${expiryText}.`,
      }
    case 'CANCELLATION':
      return {
        subject: 'Subscription Cancellation Confirmed',
        title: 'Subscription Cancelled',
        description: `Your ${productName} subscription renewal was cancelled. Access remains available until ${expiryText}.`,
      }
    case 'EXPIRATION':
      return {
        subject: 'Subscription Expired',
        title: 'Subscription Expired',
        description: `Your ${productName} subscription has expired. Renew to continue premium access.`,
      }
    case 'BILLING_ISSUE':
      return {
        subject: 'Subscription Billing Issue',
        title: 'Billing Issue',
        description: `We could not renew your ${productName} subscription. Please update your payment method.`,
      }
    case 'REFUND':
      return {
        subject: 'Subscription Refunded',
        title: 'Subscription Refunded',
        description: `A refund was processed for ${productName}. Premium access may be removed.`,
      }
    case 'UNCANCELLATION':
      return {
        subject: 'Subscription Renewal Resumed',
        title: 'Subscription Renewal Resumed',
        description: `Auto-renewal resumed for ${productName}. Current access is valid until ${expiryText}.`,
      }
    default:
      return {
        subject: 'Subscription Updated',
        title: 'Subscription Updated',
        description: `Your ${productName} subscription status has been updated.`,
      }
  }
}

export const notifyUserAboutRevenueCatEvent = async (
  user: { _id: Types.ObjectId; name?: string; email?: string },
  event: RevenueCatWebhookEvent,
  subscriptionId: Types.ObjectId,
  expiresAt?: Date | null,
) => {
  const content = getSubscriptionEventContent(
    event.type,
    event.product_id,
    expiresAt,
  )

  await NotificationService.createNotificationIntoDB({
    receiver: user._id,
    message: content.title,
    description: content.description,
    reference: subscriptionId,
    model_type: modeType.Subscription,
  })

  if (user.email) {
    const emailQueue = getEmailQueue()
    await emailQueue.add(
      'send-subscription-email',
      {
        email: user.email,
        subject: content.subject,
        name: user.name,
        title: content.title,
        description: content.description,
        productId: event.product_id,
        eventType: event.type,
        expiresAt,
      },
      { priority: 1, attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    )
  }
}

export const upsertRevenueCatPayment = async (
  event: RevenueCatWebhookEvent,
  subscriptionId: Types.ObjectId,
  userId: Types.ObjectId,
) => {
  const payableEventTypes = [
    'INITIAL_PURCHASE',
    'RENEWAL',
    'PRODUCT_CHANGE',
    'REFUND',
    'BILLING_ISSUE',
  ]
  if (!payableEventTypes.includes(event.type || '')) return null

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
