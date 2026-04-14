import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Reminder title is required!',
    }),
    logAt: z.string({
      required_error: 'Reminder log at time is required!',
    }),
  }),
})

export const ReminderValidation = {
  createValidationSchema
}