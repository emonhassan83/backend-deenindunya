import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Room name is required!',
    }),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
  }),
})

export const RoomValidation = {
  createValidationSchema,
  updateValidationSchema,
}
