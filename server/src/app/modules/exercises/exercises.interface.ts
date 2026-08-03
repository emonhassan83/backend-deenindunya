import { Model, Types } from 'mongoose'

export type TExercise = {
  __id?: string
  user: Types.ObjectId
  name: string
  reps: number
  category: string
  isCompleted: boolean
  logAt: string
  deleteAt?: Date
}

export type TExerciseModel = Model<TExercise, Record<string, unknown>>
