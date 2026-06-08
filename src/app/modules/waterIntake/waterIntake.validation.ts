import { z } from 'zod'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

const createValidationSchema = z.object({
  body: z.object({
    amountMl: z
      .number({
        message: 'Water amount is required',
      })
      .int('Amount must be an integer')
      .min(50, 'Amount must be at least 50ml')
      .max(5000, 'Amount cannot exceed 5000ml (5L)'),
    logAt: dateSchema,
  }),
})

export const WaterIntakeValidation = {
  createValidationSchema,
}
