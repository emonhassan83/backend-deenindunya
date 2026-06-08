import { z } from 'zod'
import { USER_STATUS } from './user.constant'

// Define the Zod validation schema
const createValidationSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'User name is required!',
    }),
    email: z.string({
      message: 'Email is required!',
    }),
    contractNumber: z.string({
      message: 'contractNumber is required!',
    }),
    country: z.string({
      message: 'Country is required!',
    }),
  }),
})

const setPasswordValidationSchema = z.object({
  body: z.object({
    password: z
      .string({
        message: 'Password must be a string',
      })
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(12, { message: 'Password cannot be more than 12 characters' }),
    confirmPassword: z
      .string({
        message: 'Password must be a string',
      })
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(12, { message: 'Password cannot be more than 12 characters' }),
  }),
})

const updateValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contractNumber: z.string().optional(),

    // Address fields
    country: z.string().optional(),
    address: z.string().optional(),

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
      message: 'User id is required!',
    }),
    status: z.enum(Object.values(USER_STATUS) as [string, ...string[]], {
      message: 'User status is required!',
    }),
  }),
})

const updateLocationValidationSchema = z.object({
  body: z.object({
    longitude: z.number({
      message: 'longitude is required!',
    }),
    latitude: z.number({
      message: 'latitude is required!',
    }),
  }),
})

const updateNotifyValidationSchema = z.object({
  body: z.object({
    pushNotification: z.boolean({
      message: 'pushNotification is required!',
    }),
    soundEffect: z.boolean({
      message: 'soundEffect is required!',
    }),
    automaticallyBrightness: z.boolean({
      message: 'automaticallyBrightness is required!',
    }),
    vibration: z.boolean({
      message: 'vibration is required!',
    }),
  }),
})

export const UserValidation = {
  createValidationSchema,
  setPasswordValidationSchema,
  updateValidationSchema,
  changeStatusValidationSchema,
  updateLocationValidationSchema,
  updateNotifyValidationSchema
}
