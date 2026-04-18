import { Model, Types } from 'mongoose'
import { TPackage } from '../package/package.interface'
import { TPaymentStatus, TSubscriptionStatus } from './subscription.constants'

export interface TSubscriptions {
  user: Types.ObjectId
  package: Types.ObjectId | TPackage
  transactionId: string
  amount: number
  paymentStatus: TPaymentStatus
  status: TSubscriptionStatus
  isDeleted: boolean
}

export type TSubscriptionsModel = Model<TSubscriptions, Record<string, unknown>>
