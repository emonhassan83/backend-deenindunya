import { Schema, model } from 'mongoose'
import { TExercise, TExerciseModel } from './exercises.interface'
import { ExerciseCategory } from './exercises.constant'

const exerciseSchema = new Schema<TExercise>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    reps: {
      type: Number,
      required: [true, 'Reps/Duration is required'],
      min: [1, 'Reps must be at least 1'],
    },
    category: {
      type: String,
      enum: Object.values(ExerciseCategory),
      required: [true, 'Category is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
)

exerciseSchema.index({ user: 1, category: 1, isCompleted: 1 })
exerciseSchema.index({ name: 'text' })

export const Exercise = model<TExercise, TExerciseModel>(
  'Exercise',
  exerciseSchema
)