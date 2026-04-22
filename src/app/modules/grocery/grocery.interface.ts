import { Model, Types } from 'mongoose'

export interface TGrocery {
  _id?: string
  user: Types.ObjectId
  name: string
  logAt: string
  isCompleted: boolean
  userTimeZone: string
  expiryDate: Date
}

export type TGroceryModel = Model<TGrocery, Record<string, unknown>>
