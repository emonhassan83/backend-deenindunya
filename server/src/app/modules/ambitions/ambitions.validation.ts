import { z } from 'zod'
import { AmbitionsType } from './ambitions.constant'

const createValidationSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(AmbitionsType) as [string, ...string[]], {
      message: 'Ambition type is required',
    }),
    title: z
      .string({
        message: 'Title is required',
      })
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string({
        message: 'Description is required',
      })
      .min(1, 'Description cannot be empty')
      .max(1000, 'Description cannot exceed 1000 characters'),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(AmbitionsType) as [string, ...string[]]).optional(),
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    description: z
      .string()
      .min(1, 'Description cannot be empty')
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    isCompleted: z.boolean().optional(),
  }),
})

export const AmbitionValidation = {
  createValidationSchema,
  updateValidationSchema,
}
