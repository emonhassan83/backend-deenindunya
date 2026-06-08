import { Types } from 'mongoose'
import { z } from 'zod'

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
})

const createValidationSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Room name is required!',
    }),
    logAt: z.string({
      message: 'Room log at time is required!',
    }),
  }),
})

const roomTaskValidationSchema = z.object({
  body: z.object({
    room: objectIdSchema,
    title: z.string({
      message: 'Room task title is required!',
    }),
    description: z.string().optional(),
  }),
})

export const RoomValidation = {
  createValidationSchema,
  roomTaskValidationSchema,
}
