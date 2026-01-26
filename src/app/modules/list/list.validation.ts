import { z } from 'zod'
import { List_TYPE } from './list.constants'

const createValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'List name is required!',
    }),
    type: z.enum(Object.values(List_TYPE) as [string, ...string[]], {
      required_error: 'List type is required!',
    }),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
  }),
})

export const ListValidation = {
  createValidationSchema,
  updateValidationSchema,
}
