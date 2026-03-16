import { Model } from 'mongoose'
import { TCategoryType } from './category.constant'

export type TCategory = {
  _id?: string
  title: string
  type: TCategoryType
  isDeleted?: boolean
}

export type TCategoryModel = Model<TCategory, Record<string, unknown>>
