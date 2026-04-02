import { Model, Types } from 'mongoose'

export interface TReminder {
  _id?: string
  user: Types.ObjectId
  title: string
  date: string
  isCompleted: boolean
}

export type TReminderModel = Model<TReminder, Record<string, unknown>>
