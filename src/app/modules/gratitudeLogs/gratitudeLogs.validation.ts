import { z } from 'zod'
import { GratitudeType } from './gratitudeLogs.constant'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

const createValidationSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(GratitudeType) as [string, ...string[]], {
      required_error: 'Gratitude type is required',
    }),
    title: z
      .string({
        required_error: 'Title is required',
      })
      .min(5, 'Title must be at least 5 characters')
      .max(500, 'Title cannot exceed 500 characters'),
    logAt: dateSchema,
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    type: z
      .enum(Object.values(GratitudeType) as [string, ...string[]])
      .optional(),
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(500, 'Title cannot exceed 500 characters')
      .optional(),
  }),
})

export const GratitudeLogsValidation = {
  createValidationSchema,
  updateValidationSchema,
}
