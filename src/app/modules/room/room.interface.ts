import { Model, Types } from 'mongoose'

export interface TRoom {
  _id?: string
  user: Types.ObjectId
  name: string
}

export type TRoomModel = Model<TRoom, Record<string, unknown>>
