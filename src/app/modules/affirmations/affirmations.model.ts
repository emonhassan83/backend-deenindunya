import { Schema, model } from 'mongoose'
import { TAffirmation, TAffirmationModel } from './affirmations.interface'

const affirmationSchema = new Schema<TAffirmation>(
  {
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
affirmationSchema.index({ arabic_text: 'text', transliteration: 'text', english_meaning: 'text' })

// Filter out deleted affirmations by default
affirmationSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } })
  next()
})

affirmationSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } })
  next()
})

export const Affirmation = model<TAffirmation, TAffirmationModel>(
  'Affirmation',
  affirmationSchema
)