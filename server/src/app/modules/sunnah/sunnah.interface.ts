import { Model, Types } from 'mongoose'

export interface TSunnah {
  _id?: string
  category: string
  title: string
  subtitle: string
  arabicText?: string
  transliteration?: string
  translation?: string
  reference?: string
  howToPractise?: string
  explanation?: string
  isDeleted: boolean
}

export interface TSunnaMemorizedLog {
  _id?: string
  sunnah: Types.ObjectId
  user: Types.ObjectId
}

export type TSunnahModel = Model<TSunnah, Record<string, unknown>>
export type TSunnaMemorizedLogModel = Model<
  TSunnaMemorizedLog,
  Record<string, unknown>
>
