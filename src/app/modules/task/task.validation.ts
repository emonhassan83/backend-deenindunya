import { z } from 'zod'
import { TASK_TYPE } from './task.constants'

const createValidationSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(TASK_TYPE) as [string, ...string[]], {
      required_error: 'Task type is required!',
    }),
    title: z.string({
      required_error: 'Task title is required',
    }),
    logAt: z.string({
      required_error: 'Task log at time is required!',
    }),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
})

export const TaskValidation = {
  createValidationSchema,
  updateValidationSchema,
}
