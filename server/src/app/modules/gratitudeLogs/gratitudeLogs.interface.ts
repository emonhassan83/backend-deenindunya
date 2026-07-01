import { Model, Types } from 'mongoose'
import { TGratitudeType } from './gratitudeLogs.constant'

export type TGratitudeLogs = {
  __id?: string
  user: Types.ObjectId
  type: TGratitudeType
  title: string
  logAt: string
  deleteAt?: Date
}

export type TGratitudeLogsModel = Model<TGratitudeLogs, Record<string, unknown>>
