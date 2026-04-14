import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Mood title required',
      })
      .min(1, 'Mood cannot be empty')
      .max(50, 'Mood cannot exceed 50 characters'),
    emoji: z.string({
      required_error: 'Mood emoji is required',
    }),
  }),
})

const moodLogsValidationSchema = z.object({
  body: z.object({
    mood: z.string({
      required_error: 'Mood required',
    }),
    logAt: z.string({
      required_error: 'Mood logs time is required',
    }),
  }),
})

export const MoodsValidation = {
  createValidationSchema,
  moodLogsValidationSchema,
}
