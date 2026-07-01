export const SUBSCRIPTION_STATUS = {
  pending: 'pending',
  active: 'active',
  cancelled: 'cancelled',
  suspend: 'suspend'
} as const

export const PAYMENT_STATUS = {
  unpaid: 'unpaid',
  paid: 'paid',
  failed: 'failed'
} as const

export type TSubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS
export type TPaymentStatus = keyof typeof PAYMENT_STATUS
