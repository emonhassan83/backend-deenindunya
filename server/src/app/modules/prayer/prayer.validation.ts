import { z } from 'zod'
import { PRAYER_NAME } from './prayer.constants'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

const createBulkValidationSchema = z.object({
  body: z.object({
    date: dateSchema,
  }),
})

const togglePrayerStatusValidationSchema = z.object({
  params: z.object({
    prayerName: z.enum(Object.values(PRAYER_NAME)),
  }),
  query: z.object({
    date: dateSchema,
  }),
})

export const PrayerValidation = {
  createBulkValidationSchema,
  togglePrayerStatusValidationSchema,
}
