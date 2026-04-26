import { z } from 'zod'
import { ExerciseCategory } from './exercises.constant'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

const createValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Exercise name is required',
      })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    reps: z
      .number({
        required_error: 'Reps/Duration is required',
      })
      .int('Reps must be an integer')
      .min(1, 'Reps must be at least 1')
      .max(1000, 'Reps cannot exceed 1000'),
    category: z.enum(Object.values(ExerciseCategory) as [string, ...string[]], {
      required_error: 'Category is required',
    }),
    logAt: dateSchema,
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    reps: z
      .number()
      .int('Reps must be an integer')
      .min(1, 'Reps must be at least 1')
      .max(1000, 'Reps cannot exceed 1000')
      .optional(),
    category: z.enum(Object.values(ExerciseCategory) as [string, ...string[]]).optional()
  }),
})

export const ExerciseValidation = {
  createValidationSchema,
  updateValidationSchema,
}
