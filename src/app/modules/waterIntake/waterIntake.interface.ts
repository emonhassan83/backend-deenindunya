import { Model, Types } from 'mongoose'

export type TWaterIntake = {
  __id?: string
  user: Types.ObjectId
  amountMl: number
  date: string
}

export type TWaterIntakeModel = Model<TWaterIntake, Record<string, unknown>>
