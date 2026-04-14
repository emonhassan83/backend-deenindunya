import { Model, Types } from 'mongoose'

export type TMood = {
  __id?: string
  title: string
  emoji: string
  isDeleted: boolean
}

export type TMoodLogs = {
  __id?: string
  user: Types.ObjectId
  mood: Types.ObjectId
  logAt: string
}

export type TMoodModel = Model<TMood, Record<string, unknown>>
export type TMoodLogsModel = Model<TMoodLogs, Record<string, unknown>>
