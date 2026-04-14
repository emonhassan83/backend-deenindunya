import { Model, Types } from 'mongoose'

export interface TRoom {
  _id?: string
  user: Types.ObjectId
  name: string
  logAt: string
}

export interface TRoomTask {
  _id?: string
  room: Types.ObjectId
  title: string
  description: string
  isCompleted: boolean
}

export type TRoomModel = Model<TRoom, Record<string, unknown>>
export type TRoomTaskModel = Model<TRoomTask, Record<string, unknown>>
