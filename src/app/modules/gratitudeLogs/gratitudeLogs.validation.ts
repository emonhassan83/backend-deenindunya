import { z } from 'zod'
import { GratitudeType } from './gratitudeLogs.constant'

const createValidationSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(GratitudeType) as [string, ...string[]], {
      required_error: 'Gratitude type is required',
    }),
    content: z
      .string({
        required_error: 'Content is required',
      })
      .min(5, 'Content must be at least 5 characters')
      .max(500, 'Content cannot exceed 500 characters'),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(GratitudeType) as [string, ...string[]]).optional(),
    content: z
      .string()
      .min(5, 'Content must be at least 5 characters')
      .max(500, 'Content cannot exceed 500 characters')
      .optional(),
  }),
})

export const GratitudeLogsValidation = {
  createValidationSchema,
  updateValidationSchema,
}