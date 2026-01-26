import { Model, Types } from 'mongoose'
import { TUserRole, TUserStatus } from './user.constant'

interface TNotificationPreference {
  pushNotification: boolean
  soundEffect: boolean
  automaticallyBrightness: boolean
  vibration: boolean
}

interface TAdders {
  street: string
  houseNo: string
  postalCode: number
  city: string
  country: string
}

interface TStripeAccount {
  accountId: string
  isOnboarded: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

interface TPayoutSummery {
  availableBalance: number
  pendingBalance: number
  lastPayoutAt: Date
}

interface TReferral {
  referralCode: string,
  referredBy: Types.ObjectId,
  referralRewardGiven: boolean
}

export interface TUser {
  _id: Types.ObjectId
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  fcmToken: string
  photoUrl?: string
  contractNumber?: string
  latitude: number
  longitude: number
  address: TAdders
  locationUrl: string
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  role: TUserRole
  registerWith: string
  needsPasswordChange: boolean
  passwordChangedAt?: Date
  verification: {
    otp: string | number
    expiresAt: Date
    status: boolean
  }
  notificationPreference: TNotificationPreference
  stripeAccount: TStripeAccount
  payoutSummery: TPayoutSummery
  referral: TReferral
  status: TUserStatus
  packageExpiry?: Date
  expireAt: Date
  referralCode: string
  isProMember: boolean
  isNumberVerified: boolean
  isEmailVerified: boolean
  isIdentityChecked: boolean
  avgRating: number
  ratingCount: number
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
