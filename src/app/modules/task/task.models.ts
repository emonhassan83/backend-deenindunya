import { Schema, model } from 'mongoose'
import { TTask, TTaskModel } from './task.interface'
import { TASK_TYPE } from './task.constants'

const taskSchema = new Schema<TTask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TASK_TYPE),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    logAt: {
      type: String,
      required: true, // Format: "2024-12-15" (user's local date)
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // ✅ Auto delete after 30 days
    deleteAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 30) // 30 days from creation
        return date
      },
    },
  },
  { timestamps: true },
)

// No cron job needed! MongoDB handles this in background
taskSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Performance indexes
taskSchema.index({ user: 1, logAt: 1 })
taskSchema.index({ user: 1, type: 1 })
taskSchema.index({ user: 1, isCompleted: 1 })
taskSchema.index({ user: 1, logAt: 1, type: 1 })

// Pre-save middleware to ensure deleteAt is set
taskSchema.pre('save', function (next) {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    this.deleteAt = date
  }
  next()
})

export const Task = model<TTask, TTaskModel>('Task', taskSchema)
