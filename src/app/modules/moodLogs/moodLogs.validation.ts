import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    mood: z
      .string({
        required_error: 'Mood is required',
      })
      .min(1, 'Mood cannot be empty')
      .max(50, 'Mood cannot exceed 50 characters'),
    logDate: z
      .string({
        required_error: 'Log date is required',
      })
      .datetime('Invalid date format')
      .optional(),
  }),
})

export const MoodLogsValidation = {
  createValidationSchema,
}
