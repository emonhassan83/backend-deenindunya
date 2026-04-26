import { Model, Types } from 'mongoose'

export interface TSunnah {
  _id?: string
  title: string
  subtitle: string
  arabicText: string
  isDeleted: boolean
}

export interface TSunnahLog {
  _id?: string
  sunnah: Types.ObjectId
  user: Types.ObjectId
  completedAt: string
  deleteAt: Date
}

export type TSunnahModel = Model<TSunnah, Record<string, unknown>>
export type TSunnahLogModel = Model<TSunnahLog, Record<string, unknown>>
