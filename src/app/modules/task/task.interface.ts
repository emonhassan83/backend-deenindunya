import { Model, Types } from 'mongoose'
import { TTaskType } from './task.constants'

export interface TTask {
  _id?: string
  user: Types.ObjectId
  type: TTaskType
  title: string
  logAt: string
  isCompleted: boolean
  deleteAt: Date
}

export type TTaskModel = Model<TTask, Record<string, unknown>>
