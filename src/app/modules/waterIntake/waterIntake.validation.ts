import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    amountMl: z
      .number({
        required_error: 'Water amount is required',
      })
      .int('Amount must be an integer')
      .min(50, 'Amount must be at least 50ml')
      .max(5000, 'Amount cannot exceed 5000ml (5L)'),
    date: z
      .string({
        required_error: 'Date is required',
      })
      .datetime('Invalid date format')
      .optional(),
  }),
})

export const WaterIntakeValidation = {
  createValidationSchema,
}