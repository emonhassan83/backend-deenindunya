import { Schema, model } from 'mongoose'
import { TExercise, TExerciseModel } from './exercises.interface'

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
      required: [true, 'Category is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    logAt: {
      type: String,
      required: [true, 'Log date is required'],
    },
    // ✅ Auto-delete after 365 days
    deleteAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 365)
        return date
      },
    },
  },
  {
    timestamps: true,
  }
)

// TTL Index: MongoDB will automatically delete documents when deleteAt is reached
exerciseSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Pre-save middleware to ensure deleteAt is set (if not provided)
exerciseSchema.pre('save', function () {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 365) // 365 days auto-delete
    this.deleteAt = date
  }
})

exerciseSchema.index({ user: 1, category: 1, isCompleted: 1 })
exerciseSchema.index({ name: 'text' })

export const Exercise = model<TExercise, TExerciseModel>(
  'Exercise',
  exerciseSchema
)