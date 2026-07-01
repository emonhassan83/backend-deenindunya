import { Model, Types } from 'mongoose'
import { TUser } from '../user/user.interface'
import { TSubscriptions } from '../subscription/subscription.interface'
import { TPaymentStatus } from './payments.constants'

export interface TPayment {
  _id?: Types.ObjectId
  user: Types.ObjectId | TUser
  subscription: Types.ObjectId | TSubscriptions
  amount: number
  status: TPaymentStatus
  tranId: string
  isPaid: boolean
  isDeleted: boolean
}

export type TPaymentModel = Model<TPayment, Record<string, unknown>>
