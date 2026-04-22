// grocery.model.ts
import { Schema, model } from 'mongoose'
import { TGrocery, TGroceryModel } from './grocery.interface'

const listSchema = new Schema<TGrocery>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    logAt: {
      type: String,
      required: true, // Format: YYYY-MM-DD (user's local date)
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    // ✅ Auto delete after 7 days
    deleteAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 7) // 7 days from creation
        return date
      },
    },
  },
  { timestamps: true },
)

// No cron job needed! MongoDB handles this in background
listSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Index for efficient deletion
listSchema.index({ user: 1, logAt: 1 })
listSchema.index({ user: 1, isCompleted: 1 })

// Pre-save middleware to ensure deleteAt is set
listSchema.pre('save', function (next) {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    this.deleteAt = date
  }
  next()
})

export const Grocery = model<TGrocery, TGroceryModel>('Grocery', listSchema)
