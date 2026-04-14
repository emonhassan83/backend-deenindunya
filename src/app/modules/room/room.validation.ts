import { Types } from 'mongoose'
import { z } from 'zod'

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
})

const createValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Room name is required!',
    }),
    logAt: z.string({
      required_error: 'Room log at time is required!',
    }),
  }),
})

const roomTaskValidationSchema = z.object({
  body: z.object({
    room: objectIdSchema,
    title: z.string({
      required_error: 'Room task title is required!',
    }),
    description: z.string().optional(),
  }),
})

export const RoomValidation = {
  createValidationSchema,
  roomTaskValidationSchema,
}
