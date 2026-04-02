import { Types } from 'mongoose';
import { z } from 'zod'

const objectIdSchema = z.string().refine(val => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

const createValidationSchema = z.object({
  body: z.object({
    user: objectIdSchema,
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