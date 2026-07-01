import { Model, Types } from 'mongoose'

export interface TContents {
  _id?: string | Types.ObjectId
  key: string
  value: any
}

export type TContentsModel = Model<TContents, Record<string, unknown>>
