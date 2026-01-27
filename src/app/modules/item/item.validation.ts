import { Types } from 'mongoose';
import { z } from 'zod'

const objectIdSchema = z.string().refine(val => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

const createValidationSchema = z.object({
  body: z.object({
    list: objectIdSchema,
    title: z.string({
      required_error: 'Item title is required!',
    }),
  }),
})

export const ItemValidation = {
  createValidationSchema
}
