import { z } from 'zod'
import { ALLOWED_KEYS } from './contents.constants'

export const createOrUpdateContentZodSchema = z.object({
  params: z.object({
    key: z.enum(ALLOWED_KEYS as unknown as [string, ...string[]], {
      message: 'Invalid content key provided',
    }),
  }),
  body: z.object({
    value: z.any(),
  }),
})

export const updateGeneralsZodSchema = z.object({
  body: z
    .object({
      waterIntake: z.array(z.string()).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one general content value must be provided',
    }),
})

export const contentsValidation = {
  createOrUpdateContentZodSchema,
  updateGeneralsZodSchema,
}
