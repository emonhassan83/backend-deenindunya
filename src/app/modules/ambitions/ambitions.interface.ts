import { Model, Types } from 'mongoose'
import { TAmbitionsType } from './ambitions.constant'

export type TAmbition = {
  __id?: string
  user: Types.ObjectId
  type: TAmbitionsType
  title: string
  description: string
  isCompleted: boolean
  completedAt?: string
}

export type TAmbitionModel = Model<TAmbition, Record<string, unknown>>
