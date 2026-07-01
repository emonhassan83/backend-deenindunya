import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    title: z.string({
      message: 'Reminder title is required!',
    }),
    logAt: z.string({
      message: 'Reminder log at time is required!',
    }),
  }),
})

export const ReminderValidation = {
  createValidationSchema
}