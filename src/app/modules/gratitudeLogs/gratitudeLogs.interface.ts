import { Model, Types } from 'mongoose'
import { TGratitudeType } from './gratitudeLogs.constant'

export type TAmbition = {
  __id?: string
  user: Types.ObjectId
  type: TGratitudeType
  content: string
}

export type TAmbitionModel = Model<TAmbition, Record<string, unknown>>
