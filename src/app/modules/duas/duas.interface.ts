import { Model, Types } from 'mongoose'

export type TDuas = {
  __id?: string
  category: Types.ObjectId
  arabic_text: string
  transliteration: string
  english_meaning: string
  reference: string
  audio_url?: string
  benefit: string
  isDeleted?: boolean
}

export type TDuasModel = Model<TDuas, Record<string, unknown>>
