import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Grocery name is required!',
    }),
    logAt: z.string({
      required_error: 'Grocery log at time is required!',
    }),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
  }),
})

export const GroceryValidation = {
  createValidationSchema,
  updateValidationSchema,
}
