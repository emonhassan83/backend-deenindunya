import { Model, Types } from 'mongoose'
import { TPrayerName } from './prayer.constants'

export interface TPrayer {
  _id?: string
  user: Types.ObjectId | string
  name: TPrayerName
  date: string
  prayed: boolean
  prayedAt?: Date
}

export type TPrayerModel = Model<TPrayer, Record<string, unknown>>
