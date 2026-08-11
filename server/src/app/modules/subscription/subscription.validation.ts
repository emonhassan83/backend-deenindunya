import { z } from 'zod'

const syncRevenueCatValidationSchema = z.object({
  body: z.object({
    revenueCatAppUserId: z.string().trim().min(1).optional(),
  }),
})

export const subscriptionValidation = {
  syncRevenueCatValidationSchema,
}
