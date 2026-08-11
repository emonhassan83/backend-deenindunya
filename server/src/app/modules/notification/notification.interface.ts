import { Types } from 'mongoose'

export enum modeType {
  Auth = 'Auth',
  User = 'User',
  Payment = 'Payment',
  Subscription = 'Subscription',
}

export type TNotification = {
  receiver?: Types.ObjectId | string
  message: string
  description?: string
  reference?: Types.ObjectId | string
  model_type?: modeType
  date?: Date
  read?: boolean
}
