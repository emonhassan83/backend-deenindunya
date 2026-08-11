import { Model, Types } from 'mongoose'
import { TUser } from '../user/user.interface'
import { TSubscriptions } from '../subscription/subscription.interface'
import { TPaymentStatus } from './payments.constants'

export interface TPayment {
  _id?: Types.ObjectId
  user: Types.ObjectId | TUser
  subscription: Types.ObjectId | TSubscriptions
  revenueCatEventId?: string | null
  revenueCatEventType?: string | null
  revenueCatProductId?: string | null
  revenueCatTransactionId?: string | null
  revenueCatOriginalTransactionId?: string | null
  entitlementId?: string | null
  amount: number
  currency?: string
  status: TPaymentStatus
  purchasedAt?: Date | null
  rawEventData?: Record<string, unknown>
  isDeleted: boolean
}

export type TPaymentModel = Model<TPayment, Record<string, unknown>>
