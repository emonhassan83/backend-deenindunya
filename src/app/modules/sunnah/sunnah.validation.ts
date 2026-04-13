import { z } from 'zod';

const createValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    subtitle: z.string({ required_error: 'Subtitle is required' }),
    arabicText: z.string().optional(),
  }),
});

const updateValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    arabicText: z.string().optional(),
  }),
});

export const SunnahValidation = {
  createValidationSchema,
  updateValidationSchema,
};
