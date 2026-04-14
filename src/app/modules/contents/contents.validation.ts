import { z } from 'zod'

const createValidationSchema = z.object({
  body: z.object({
    termsAndConditions: z
      .string({ required_error: 'terms and conditions us is required' })
      .optional(),
    privacyPolicy: z
      .string({ required_error: 'privacy policy us is required' })
      .optional()
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    termsAndConditions: z
      .string({ required_error: 'terms and conditions us is required' })
      .optional(),
    privacyPolicy: z
      .string({ required_error: 'privacy policy us is required' })
      .optional(),
  }),
})

export const contentsValidation = {
  createValidationSchema,
  updateValidationSchema
}
