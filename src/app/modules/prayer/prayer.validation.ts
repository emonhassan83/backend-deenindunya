import { z } from 'zod'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

const createBulkValidationSchema = z.object({
  body: z.object({
    date: dateSchema
  }),
})

export const PrayerValidation = {
  createBulkValidationSchema,
}
