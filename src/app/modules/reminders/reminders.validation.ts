import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Reminder title is required!',
    }),
    date: z.string({
      required_error: 'Reminder date is required!',
    }),
  }),
})

export const ReminderValidation = {
  createValidationSchema
}