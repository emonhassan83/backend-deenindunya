// grocery.model.ts
import { Schema, model } from 'mongoose'
import moment from 'moment-timezone'
import { TGrocery, TGroceryModel } from './grocery.interface';

const listSchema = new Schema<TGrocery>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    userTimeZone: {
      type: String,
      required: true,
      default: 'Asia/Dhaka',
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate expiryDate
listSchema.pre('save', function(next) {
  if (!this.logAt || !this.userTimeZone) {
    return next()
  }
  
  // Parse the logAt date in user's timezone
  const userDate = moment.tz(this.logAt, 'YYYY-MM-DD', this.userTimeZone)
  // Expires at next day 12:00 AM user's timezone
  const expiryMoment = userDate.clone().add(1, 'day').startOf('day')
  this.expiryDate = expiryMoment.toDate()
  
  next()
})

// Index for efficient deletion
listSchema.index({ expiryDate: 1, isCompleted: 1 })
listSchema.index({ user: 1, logAt: 1 })

export const Grocery = model<TGrocery, TGroceryModel>("Grocery", listSchema);