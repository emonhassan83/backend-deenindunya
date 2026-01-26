import { z } from 'zod'
import { USER_STATUS } from './user.constant'

// Define the Zod validation schema
const createValidationSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: 'User first name is required!',
    }),
    lastName: z.string({
      required_error: 'User first name is required!',
    }),
    email: z.string({
      required_error: 'Email is required!',
    }),
    password: z
      .string({
        invalid_type_error: 'Password must be a string',
      })
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(12, { message: 'Password cannot be more than 12 characters' }),
    contractNumber: z.string({
      required_error: 'contractNumber is required!',
    }),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    contractNumber: z.string().optional(),

    // Address fields
    address: z
      .object({
        street: z.string().optional(),
        houseNo: z.string().optional(),
        postalCode: z.number().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),

    // Main location
    latitude: z.number().optional(),
    longitude: z.number().optional(),

    // Notification preferences
    notificationPreference: z
      .object({
        pushNotification: z.boolean().optional(),
        soundEffect: z.boolean().optional(),
        automaticallyBrightness: z.boolean().optional(),
        vibration: z.boolean().optional(),
      })
      .optional(),
  }),
})

const changeStatusValidationSchema = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User id is required!',
    }),
    status: z.enum(Object.values(USER_STATUS) as [string, ...string[]], {
      required_error: 'User status is required!',
    }),
  }),
})

const updateLocationValidationSchema = z.object({
  body: z.object({
    longitude: z.number({
      required_error: 'longitude is required!',
    }),
    latitude: z.number({
      required_error: 'latitude is required!',
    }),
  }),
})

export const UserValidation = {
  createValidationSchema,
  updateValidationSchema,
  changeStatusValidationSchema,
  updateLocationValidationSchema,
}
