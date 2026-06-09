import { z } from 'zod'

const prayerNameSchema = z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], {
  message: 'Prayer name is required!',
})

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

const createBulkValidationSchema = z.object({
  body: z.object({
    date: dateSchema,
    prayers: z
      .array(
        z.object({
          name: prayerNameSchema,
        }),
      )
      .min(1)
      .max(5),
  }),
})

export const PrayerValidation = {
  createBulkValidationSchema,
}
