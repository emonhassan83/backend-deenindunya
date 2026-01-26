import { Types } from 'mongoose'

export enum modeType {
  Auth = 'Auth',
  User = 'User',
  Shipment = 'Shipment',
  Trip = 'Trip',
  Order = 'Order',
  Support = 'Support',
  Payment = 'Payment',
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
