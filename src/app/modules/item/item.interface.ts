import { Model, Types } from 'mongoose'
import { TListType } from './item.constants'

export interface TList {
  _id?: string
  user: Types.ObjectId
  type: TListType
  name: string
}

export type TListModel = Model<TList, Record<string, unknown>>
