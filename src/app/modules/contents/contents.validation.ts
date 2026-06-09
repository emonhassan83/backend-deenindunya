import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    termsAndConditions: z
      .string({ message: 'terms and conditions us is required' })
      .optional(),
    privacyPolicy: z
      .string({ message: 'privacy policy us is required' })
      .optional()
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    termsAndConditions: z
      .string({ message: 'terms and conditions us is required' })
      .optional(),
    privacyPolicy: z
      .string({ message: 'privacy policy us is required' })
      .optional(),
  }),
})

export const contentsValidation = {
  createValidationSchema,
  updateValidationSchema
}
