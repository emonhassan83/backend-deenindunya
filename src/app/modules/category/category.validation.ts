import { z } from 'zod'
import { categoryType } from './category.constant'

const createValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Category title is required',
    }),
    type: z.enum(Object.values(categoryType) as [string, ...string[]], {
      required_error: 'Category type is required',
    }),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Category title is required',
      })
  }),
})

export const CategoryValidation = {
  createValidationSchema,
  updateValidationSchema,
}
