import bcrypt from 'bcrypt'
import config from '../../config'
import { Schema, model } from 'mongoose'
import { TUser, UserModel } from './user.interface'
import { REGISTER_WITH, USER_ROLE, USER_STATUS } from './user.constant'
import { generateCryptoString } from '../../utils/generateCryptoString'

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

// Main user schema
const userSchema = new Schema<TUser>(
  {
    id: { type: String, unique: true, default: () => generateCryptoString(10) },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    fcmToken: { type: String, default: null },
    photoUrl: { type: String, default: null },
    contractNumber: { type: String, default: null },
    country: { type: String, required: false },
    address: { type: String, default: null },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    locationUrl: { type: String, default: null },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    timezone: { type: String, default: null },
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
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.active,
    },
    expireAt: { type: Date, default: () => new Date(Date.now() + 30 * 60000) },
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
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    )
  }
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
