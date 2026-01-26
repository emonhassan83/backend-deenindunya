import { Model, Types } from 'mongoose'
import { TTaskType } from './task.constants'

export interface TTask {
  _id?: string
  user: Types.ObjectId
  type: TTaskType
  title: string
  isCompleted: boolean
}

export type TTaskModel = Model<TTask, Record<string, unknown>>
