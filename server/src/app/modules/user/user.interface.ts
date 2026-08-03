import { Model, Types } from 'mongoose'
import { TUserRole, TUserStatus } from './user.constant'

interface TNotificationPreference {
  pushNotification: boolean
  soundEffect: boolean
  automaticallyBrightness: boolean
  vibration: boolean
}

export interface TUser {
  _id: Types.ObjectId
  id: string
  name: string
  email: string
  password: string
  fcmToken: string
  photoUrl?: string
  contractNumber?: string
  country: string
  address?: string
  latitude: number
  longitude: number
  locationUrl: string
  dailyGoalMl?: number
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  timezone: string
  role: TUserRole
  registerWith: string
  needsPasswordChange: boolean
  passwordChangedAt: Date
  isSignUpOtpVerified: boolean
  notificationPreference: TNotificationPreference
  status: TUserStatus
  expireAt: Date
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface TReqUser {
  _id: string
  email: string
  role: TUserRole
  iat: number
  exp: number
}

export interface UserModel extends Model<TUser> {
  isUserExistsByUserName(name: string): Promise<TUser>
  isUserExistsByEmail(email: string): Promise<TUser>

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>
}
