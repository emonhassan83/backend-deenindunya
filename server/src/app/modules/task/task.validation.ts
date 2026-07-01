import { z } from 'zod'
import { TASK_TYPE } from './task.constants'

const createValidationSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(TASK_TYPE) as [string, ...string[]], {
      message: 'Task type is required!',
    }),
    title: z.string({
      message: 'Task title is required',
    }),
    logAt: z.string({
      message: 'Task log at time is required!',
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
