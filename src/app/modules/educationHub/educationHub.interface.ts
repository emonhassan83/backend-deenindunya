import { Model, Types } from 'mongoose'

export interface TModule {
  _id?: string
  name: string
  // coverImage: string
}

export interface TLesson {
  _id?: string
  module: Types.ObjectId
  type: string
  title: string
}

export interface TLessonLogs {
  _id?: string
  user: Types.ObjectId
  lesson: Types.ObjectId
  isRead: boolean
  readAt?: Date
}

export type TModuleModel = Model<TModule, Record<string, unknown>>
export type TLessonModel = Model<TLesson, Record<string, unknown>>
export type TLessonLogsModel = Model<TLessonLogs, Record<string, unknown>>
