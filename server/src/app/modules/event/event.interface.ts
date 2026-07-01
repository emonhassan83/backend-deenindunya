import { Model, Types } from 'mongoose'
import { TEventType } from './event.constants'

export interface TEvent {
  _id?: string
  user?: Types.ObjectId
  type: TEventType
  title: string
  description: string
  date: string
}

export type TEventModel = Model<TEvent, Record<string, unknown>>
