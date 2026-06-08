import { z } from 'zod'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

const createValidationSchema = z.object({
  body: z.object({
    title: z
      .string({
        message: 'Mood title required',
      })
      .min(1, 'Mood cannot be empty')
      .max(50, 'Mood cannot exceed 50 characters'),
    emoji: z.string({
      message: 'Mood emoji is required',
    }),
  }),
})

const moodLogsValidationSchema = z.object({
  body: z.object({
    mood: z.string({
      message: 'Mood required',
    }),
    logAt: dateSchema,
  }),
})

export const MoodsValidation = {
  createValidationSchema,
  moodLogsValidationSchema,
}
