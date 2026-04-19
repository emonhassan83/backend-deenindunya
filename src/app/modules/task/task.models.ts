import { Schema, model } from 'mongoose'
import moment from 'moment-timezone'
import { TTask, TTaskModel } from './task.interface';
import { TASK_TYPE } from './task.constants';


const taskSchema = new Schema<TTask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    expiryDate: {
      type: Date, // UTC timestamp for easy cron job deletion
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    userTimeZone: {
      type: String,
      required: true,
      default: 'Asia/Dhaka', // User's timezone
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate expiryDate
taskSchema.pre('save', function(next) {
  if (!this.logAt || !this.type || !this.userTimeZone) {
    return next()
  }
  
  // Parse the logAt date in user's timezone
  const userDate = moment.tz(this.logAt, 'YYYY-MM-DD', this.userTimeZone)
  let expiryMoment
  
  switch (this.type) {
    case TASK_TYPE.daily:
      // Next day at 12:00 AM user's timezone
      expiryMoment = userDate.clone().add(1, 'day').startOf('day')
      break
    case TASK_TYPE.weekly:
      // Next week at 12:00 AM user's timezone
      expiryMoment = userDate.clone().add(1, 'week').startOf('day')
      break
    case TASK_TYPE.monthly:
      // Next month at 12:00 AM user's timezone
      expiryMoment = userDate.clone().add(1, 'month').startOf('day')
      break
    default:
      expiryMoment = userDate.clone().add(1, 'day').startOf('day')
  }
  
  // Convert to UTC for storage
  this.expiryDate = expiryMoment.toDate()
  next()
})

export const Task = model<TTask, TTaskModel>("Task", taskSchema);