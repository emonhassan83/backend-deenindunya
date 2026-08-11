import { Model, Types } from 'mongoose'
import { TPackage } from '../package/package.interface'
import { TSubscriptionStatus } from './subscription.constants'

export interface TSubscriptions {
  _id?: Types.ObjectId
  user: Types.ObjectId
  package?: Types.ObjectId | TPackage
  revenueCatAppUserId: string
  revenueCatOriginalTransactionId?: string | null
  revenueCatTransactionId?: string | null
  revenueCatEventId?: string | null
  productId?: string | null
  entitlementId?: string | null
  store?: string | null
  status: TSubscriptionStatus
  currentPeriodStartsAt?: Date | null
  currentPeriodEndsAt?: Date | null
  cancelledAt?: Date | null
  expiresAt?: Date | null
  willRenew?: boolean
  rawEventData?: Record<string, unknown>
}

export type TSubscriptionsModel = Model<TSubscriptions, Record<string, unknown>>
