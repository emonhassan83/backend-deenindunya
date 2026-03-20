import { Model, Types } from 'mongoose'

export type TMoodLogs = {
  __id?: string
  user: Types.ObjectId
  mood: string
  logDate: string
}

export type TMoodLogsModel = Model<TMoodLogs, Record<string, unknown>>
