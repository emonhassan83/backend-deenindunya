import { z } from 'zod';

const createValidationSchema = z.object({
  body: z.object({
    category: z.string({ message: 'Category is required' }),
    title: z.string({ message: 'Title is required' }),
    subtitle: z.string({ message: 'Subtitle is required' }),
    arabicText: z.string().optional(),
  }),
});

const updateValidationSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    arabicText: z.string().optional(),
  }),
});

const toggleSunnahLogValidationSchema = z.object({
  body: z.object({
    completedAt: z.string({
      message: 'completedAt is required',
    }).regex(/^\d{4}-\d{2}-\d{2}$/, 'completedAt must be in YYYY-MM-DD format'),
  }),
});

export const SunnahValidation = {
  createValidationSchema,
  updateValidationSchema,
  toggleSunnahLogValidationSchema
};
