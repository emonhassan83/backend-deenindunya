import { z } from 'zod'
import { PRAYER_NAME, PRAYER_REMINDER_OFFSETS } from './prayer.constants'

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

const prayerReminderPrefSchema = z
  .object({
    enabled: z.boolean().optional(),
    offsetMinutes: z
      .number()
      .refine(
        (val): val is (typeof PRAYER_REMINDER_OFFSETS)[number] =>
          (PRAYER_REMINDER_OFFSETS as readonly number[]).includes(val),
        { message: 'offsetMinutes must be 0, 5, or 10' },
      )
      .optional(),
  })
  .strict()

const updateReminderSettingsValidationSchema = z.object({
  body: z
    .object({
      fajr: prayerReminderPrefSchema.optional(),
      dhuhr: prayerReminderPrefSchema.optional(),
      asr: prayerReminderPrefSchema.optional(),
      maghrib: prayerReminderPrefSchema.optional(),
      isha: prayerReminderPrefSchema.optional(),
    })
    .strict()
    .refine(
      (body) => Object.keys(body).length > 0,
      { message: 'At least one prayer reminder update is required' },
    ),
})

export const PrayerValidation = {
  createBulkValidationSchema,
  togglePrayerStatusValidationSchema,
  updateReminderSettingsValidationSchema,
}
