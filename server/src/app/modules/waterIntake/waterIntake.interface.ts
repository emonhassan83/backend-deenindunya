import { Model, Types } from 'mongoose'

export type TWaterIntake = {
  __id?: string
  user: Types.ObjectId
  amountMl: number
  logAt: string
  deleteAt: Date
}

export type TWaterIntakeModel = Model<TWaterIntake, Record<string, unknown>>
