import { Model, Types } from 'mongoose'

export interface TSurah {
  _id?: string
  number: number // Surah number (1–114)
  name: string // Surah name (Al-Fatiha, Al-Baqarah, etc.)
  totalVerses: number // Verse count
}

export interface TSurahVerse {
  _id?: string
  surahId: Types.ObjectId // Forign key to TSurah
  verseNumber: number
  arabicText: string
  translation: string
  audioUrl: string
}

export type TSurahModel = Model<TSurah, Record<string, unknown>>
export type TSurahVerseModel = Model<TSurahVerse, Record<string, unknown>>
