import { Model, Types } from 'mongoose'

export interface TItem {
  _id?: string
  list: Types.ObjectId
  title: string
  isCompleted: boolean
}

export type TItemModel = Model<TItem, Record<string, unknown>>
