import { Model, Types } from 'mongoose'
import { TExerciseCategory } from './exercises.constant'

export type TExercise = {
  __id?: string
  user: Types.ObjectId
  name: string
  reps: number
  category: TExerciseCategory
  isCompleted: boolean
}

export type TExerciseModel = Model<TExercise, Record<string, unknown>>
