import { Model, Types } from 'mongoose'

export interface TReminder {
  _id?: string
  user: Types.ObjectId
  title: string
  logAt: string
  isCompleted: boolean
  deleteAt: Date
}

export type TReminderModel = Model<TReminder, Record<string, unknown>>
