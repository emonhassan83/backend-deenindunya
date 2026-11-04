import { Types } from 'mongoose'
import { z } from 'zod'
import { modeType } from './notification.interface'

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
})

const createValidationSchema = z.object({
  body: z.object({
    receiver: objectIdSchema,
    message: z
      .string({ message: 'Message is required' })
      .min(1, 'Message cannot be empty')
      .max(200, 'Message cannot exceed 200 characters'),
    description: z
      .string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional()
      .default(''),
    model_type: z.nativeEnum(modeType).optional(),
    reference: objectIdSchema.optional(),
  }),
})

export const NotificationValidation = {
  createValidationSchema,
}
