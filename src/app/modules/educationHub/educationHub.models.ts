import { Schema, model } from 'mongoose'
import {
  TLesson,
  TLessonLogs,
  TLessonLogsModel,
  TLessonModel,
  TModule,
  TModuleModel,
} from './educationHub.interface'

const moduleSchema = new Schema<TModule>(
  {
    name: { type: String, required: true },
  },
  { timestamps: true },
)

const lessonSchema = new Schema<TLesson>(
  {
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true },
)

const lessonLogsSchema = new Schema<TLessonLogs>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Surah', required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true },
)

export const Module = model<TModule, TModuleModel>('Module', moduleSchema)
export const Lesson = model<TLesson, TLessonModel>('Lesson', lessonSchema)
export const LessonLogs = model<TLessonLogs, TLessonLogsModel>(
  'LessonLogs',
  lessonLogsSchema,
)
