import { Schema, model } from 'mongoose'
import { TDuas, TDuasModel } from './duas.interface'

const duasSchema = new Schema<TDuas>(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    banner: {
      type: String,
      required: [true, 'Banner is required'],
      trim: true,
    },
    arabic_text: {
      type: String,
      required: [true, 'Arabic text is required'],
      trim: true,
    },
    transliteration: {
      type: String,
      required: [true, 'Transliteration is required'],
      trim: true,
    },
    english_meaning: {
      type: String,
      required: [true, 'English meaning is required'],
      trim: true,
    },
    reference: {
      type: String,
      required: [true, 'Reference is required'],
      trim: true,
    },
    audio_url: {
      type: String,
      trim: true,
      default: '',
    },
    benefit: {
      type: String,
      required: [true, 'Benefit is required'],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for search
duasSchema.index({ arabic_text: 'text', transliteration: 'text', english_meaning: 'text' })

export const Duas = model<TDuas, TDuasModel>('Duas', duasSchema)