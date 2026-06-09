import { z } from 'zod'
import { EVENT_TYPE } from './event.constants'

const createValidationSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(EVENT_TYPE) as [string, ...string[]], {
      message: 'Event type is required!',
    }),
    title: z.string({ message: 'Title is required' }),
    description: z.string().optional(),
    date: z.string({ message: 'Date is required' }),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
  }),
})

export const EventValidation = {
  createValidationSchema,
  updateValidationSchema,
}
