import bcrypt from 'bcrypt'
import config from '../../config'
import { Schema, model } from 'mongoose'
import { TUser, UserModel } from './user.interface'
import { REGISTER_WITH, USER_ROLE, USER_STATUS } from './user.constant'
import { generateCryptoString } from '../../utils/generateCryptoString'
import { generateReferralCode } from '../../utils/generateReferralCode'

// Notification preference schema
const notificationPreferenceSchema = new Schema(
  {
    pushNotification: { type: Boolean, default: true },
    soundEffect: { type: Boolean, default: true },
    automaticallyBrightness: { type: Boolean, default: true },
    vibration: { type: Boolean, default: true },
  },
  { _id: false },
)

// Address schema
const addressSchema = new Schema(
  {
    street: { type: String, default: '' },
    houseNo: { type: String, default: '' },
    postalCode: { type: Number, default: 0 },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  { _id: false },
)

// Stripe account schema
const stripeAccountSchema = new Schema(
  {
    accountId: { type: String, default: '' },
    isOnboarded: { type: Boolean, default: false },
    chargesEnabled: { type: Boolean, default: false },
    payoutsEnabled: { type: Boolean, default: false },
  },
  { _id: false },
)

// Payout summary schema
const payoutSummarySchema = new Schema(
  {
    availableBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    lastPayoutAt: { type: Date, default: null },
  },
  { _id: false },
)

// Referral schema
const referralSchema = new Schema(
  {
    referralCode: { type: String, default: () => generateReferralCode() },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    referralRewardGiven: { type: Boolean, default: false },
  },
  { _id: false },
)

// Main user schema
const userSchema = new Schema<TUser>(
  {
    id: { type: String, unique: true, default: () => generateCryptoString(10) },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fcmToken: { type: String, default: null },
    photoUrl: { type: String, default: null },
    contractNumber: { type: String, default: null },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    address: { type: addressSchema, default: {} },
    locationUrl: { type: String, default: null },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.user,
    },
    registerWith: {
      type: String,
      enum: Object.values(REGISTER_WITH),
      default: REGISTER_WITH.credentials,
    },
    needsPasswordChange: { type: Boolean, default: true },
    passwordChangedAt: { type: Date, default: null },
    verification: {
      otp: { type: Schema.Types.Mixed, default: 0 },
      expiresAt: { type: Date, default: null },
      status: { type: Boolean, default: false },
    },
    notificationPreference: { type: notificationPreferenceSchema, default: {} },
    stripeAccount: { type: stripeAccountSchema, default: {} },
    payoutSummery: { type: payoutSummarySchema, default: {} },
    referral: { type: referralSchema, default: {} },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.active,
    },
    packageExpiry: { type: Date, default: null },
    expireAt: { type: Date, default: () => new Date(Date.now() + 30 * 60000) },
    referralCode: { type: String, default: () => generateReferralCode() },
    isProMember: { type: Boolean, default: false },
    isNumberVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isIdentityChecked: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// added index for auto delete
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })
userSchema.index({ location: '2dsphere' })

//* Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    )
  }
  next()
})

//* Static method to check if user exists by email
userSchema.statics.isUserExistsByEmail = async function (
  email: string,
): Promise<TUser | null> {
  return await this.findOne({ email })
}

//* Static method to compare passwords
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashedPassword)
}

export const User = model<TUser, UserModel>('User', userSchema)
