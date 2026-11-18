import { Model } from 'mongoose'

export type TDuas = {
  _id?: string
  category: string
  banner: string
  arabic_text: string
  transliteration: string
  english_meaning: string
  reference: string
  audio_url?: string
  benefit: string
  recited_count?: number
  isDeleted?: boolean
}

export type TDuasModel = Model<TDuas, Record<string, unknown>>
