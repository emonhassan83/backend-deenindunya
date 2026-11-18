import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    category: z.string({ message: 'Category is required' }),
    title: z.string({ message: 'Title is required' }),
    subtitle: z.string({ message: 'Subtitle is required' }),
    arabicText: z.string().optional(),
    transliteration: z.string().optional(),
    translation: z.string().optional(),
    reference: z.string().optional(),
    howToPractise: z.string().optional(),
    explanation: z.string().optional(),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    arabicText: z.string().optional(),
    transliteration: z.string().optional(),
    translation: z.string().optional(),
    reference: z.string().optional(),
    howToPractise: z.string().optional(),
    explanation: z.string().optional(),
  }),
})

export const SunnahValidation = {
  createValidationSchema,
  updateValidationSchema,
}
