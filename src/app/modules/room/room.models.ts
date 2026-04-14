import { Schema, model } from 'mongoose'
import { TRoom, TRoomModel, TRoomTask, TRoomTaskModel } from './room.interface'

const roomSchema = new Schema<TRoom>({
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
    required: true,
  },
})

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
  },
  { timestamps: true },
)

export const Room = model<TRoom, TRoomModel>('Room', roomSchema)
export const RoomTask = model<TRoomTask, TRoomTaskModel>(
  'RoomTask',
  roomTaskSchema,
)
