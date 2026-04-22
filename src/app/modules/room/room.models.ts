import { Schema, model } from 'mongoose'
import { TRoom, TRoomModel, TRoomTask, TRoomTaskModel } from './room.interface'

// Room Schema
const roomSchema = new Schema<TRoom>(
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
      required: true, // Format: YYYY-MM-DD
    },
    // ✅ Auto delete after 7 days
    deleteAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        return date
      },
    },
  },
  { timestamps: true },
)

// ✅ TTL Index - MongoDB automatically deletes rooms after 7 days
roomSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Performance indexes
roomSchema.index({ user: 1, logAt: 1 })
roomSchema.index({ user: 1, deleteAt: 1 })

// RoomTask Schema
const roomTaskSchema = new Schema<TRoomTask>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // ✅ Auto delete after 7 days (same as room)
    deleteAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        return date
      },
    },
  },
  { timestamps: true },
)

// ✅ TTL Index - MongoDB automatically deletes room tasks after 7 days
roomTaskSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 })

// Performance indexes
roomTaskSchema.index({ room: 1, isCompleted: 1 })
roomTaskSchema.index({ room: 1, deleteAt: 1 })

// Pre-save middleware for Room
roomSchema.pre('save', function (next) {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    this.deleteAt = date
  }
  next()
})

// Pre-save middleware for RoomTask
roomTaskSchema.pre('save', function (next) {
  if (!this.deleteAt) {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    this.deleteAt = date
  }
  next()
})

export const Room = model<TRoom, TRoomModel>('Room', roomSchema)
export const RoomTask = model<TRoomTask, TRoomTaskModel>('RoomTask', roomTaskSchema);
