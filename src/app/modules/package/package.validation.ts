import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    title: z
      .string({
        message: 'Package title is required!',
      })
      .min(5)
      .max(255),
    description: z.array(
      z.string({
        message: 'Description point is required!',
      }),
    ),
    price: z
      .number()
      .int('Price must be an integer')
      .min(0, 'Price must be a positive number'),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Package title is required').optional(),
    description: z
      .string({
        message: 'Description point is required!',
      })
      .optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
  }),
})

export const PackageValidation = {
  createValidationSchema,
  updateValidationSchema,
}
