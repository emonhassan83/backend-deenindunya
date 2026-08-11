export const SUBSCRIPTION_STATUS = {
  active: 'active',
  expired: 'expired',
  cancelled: 'cancelled',
  grace_period: 'grace_period',
  billing_issue: 'billing_issue',
} as const

export const REVENUECAT_EVENT_TYPE = {
  initial_purchase: 'INITIAL_PURCHASE',
  renewal: 'RENEWAL',
  cancellation: 'CANCELLATION',
  expiration: 'EXPIRATION',
  billing_issue: 'BILLING_ISSUE',
  product_change: 'PRODUCT_CHANGE',
  refund: 'REFUND',
  uncancellation: 'UNCANCELLATION',
} as const

export type TSubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS
export type TRevenueCatEventType = keyof typeof REVENUECAT_EVENT_TYPE
