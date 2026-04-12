import { Schema, model } from 'mongoose'
import {
  TSurah,
  TSurahModel,
  TSurahProgress,
  TSurahProgressModel,
  TSurahVerse,
  TSurahVerseModel,
} from './surah.interface'

const surahSchema = new Schema<TSurah>(
  {
    number: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    totalVerses: { type: Number, required: true },
  },
  { timestamps: true },
)

const surahVerseSchema = new Schema<TSurahVerse>(
  {
    surahId: { type: Schema.Types.ObjectId, ref: 'Surah', required: true },
    verseNumber: { type: Number, required: true },
    arabicText: { type: String, required: true },
    translation: { type: String, required: true },
    audioUrl: { type: String, required: true },
  },
  { timestamps: true },
)

const surahProgressSchema = new Schema<TSurahProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    surahId: { type: Schema.Types.ObjectId, ref: 'Surah', required: true },
    isMemorized: { type: Boolean, default: false },
    memorizedAt: { type: Date },
  },
  { timestamps: true },
)

// Compound index to prevent duplicate prayers
surahSchema.index({ number: 1 }, { unique: true })
surahVerseSchema.index({ surahId: 1, verseNumber: 1 }, { unique: true })
surahProgressSchema.index({ userId: 1, surahId: 1 }, { unique: true })

export const Surah = model<TSurah, TSurahModel>('Surah', surahSchema)
export const SurahVerse = model<TSurahVerse, TSurahVerseModel>(
  'SurahVerse',
  surahVerseSchema,
)
export const SurahProgress = model<TSurahProgress, TSurahProgressModel>(
  'SurahProgress',
  surahProgressSchema,
)
