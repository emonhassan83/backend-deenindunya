import { Model } from 'mongoose'

export type TAffirmation = {
  __id?: string
  arabic_text: string
  transliteration: string
  english_meaning: string
  reference: string
  audio_url?: string
  isDeleted?: boolean
}

export type TAffirmationModel = Model<TAffirmation, Record<string, unknown>>
