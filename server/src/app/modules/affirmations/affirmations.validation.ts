import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    arabic_text: z
      .string({
        message: 'Arabic text is required',
      })
      .min(1, 'Arabic text cannot be empty'),
    transliteration: z
      .string({
        message: 'Transliteration is required',
      })
      .min(1, { message: 'Transliteration cannot be empty' }),
    english_meaning: z
      .string({
        message: 'English meaning is required',
      })
      .min(1, 'English meaning cannot be empty'),
    reference: z
      .string({
        message: 'Reference is required',
      })
      .min(1, 'Reference cannot be empty'),
    audio_url: z.string().optional(),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    arabic_text: z.string().min(1, 'Arabic text cannot be empty').optional(),
    transliteration: z
      .string()
      .min(1, 'Transliteration cannot be empty')
      .optional(),
    english_meaning: z
      .string()
      .min(1, 'English meaning cannot be empty')
      .optional(),
    reference: z.string().min(1, 'Reference cannot be empty').optional(),
    audio_url: z.string().optional(),
  }),
})

export const AffirmationValidation = {
  createValidationSchema,
  updateValidationSchema,
}
