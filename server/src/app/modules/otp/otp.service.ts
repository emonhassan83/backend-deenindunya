import httpStatus from 'http-status'
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import moment from 'moment'
import config from '../../config'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { generateOtp } from '../../utils/generateOtp'
import { createToken, TExpiresIn } from '../auth/auth.utils'
import { Types } from 'mongoose'
import { OtpRedisService } from '../../redis/helpers/otp'
import { getEmailQueue } from '../../queues/queues'
import { setCache } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

const verifyOtp = async (token: string, otp: string | number) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized')
  }

  const authToken = token.replace(/^Bearer\s+/i, '')
  let decode
  try {
    decode = jwt.verify(authToken, config.jwt_access_secret as Secret) as JwtPayload
  } catch (err) {
    console.error(err)
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Session has expired. Please try to submit OTP within 5 minute',
    )
  }

  if (!decode?.email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP verification token')
  }

  const user = await User.findOne({ email: decode?.email }).select(
    'email _id name role status',
  )
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found')
  }

  // Retrieve OTP from Redis cache
  const cachedOtp = await OtpRedisService.getOtp(user.email)
  if (!cachedOtp) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'OTP has expired. Please resend it',
    )
  }

  if (Number(otp) !== Number(cachedOtp)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match')
  }

  // Delete OTP from Redis cache after verification succeeds
  await OtpRedisService.deleteOtp(user.email)

  // Store verification status in Redis with 5 minutes expiration
  await setCache(REDIS_KEYS.REGISTER_OTP_VERIFIED(user.email), 'true', 300)

  const updateUser = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        isSignUpOtpVerified: true,
        expireAt: null, // set null to prevent verify user deletion data
      },
    },
    { new: true },
  ).select('email _id name role')

  const jwtPayload = {
    _id: updateUser?._id as Types.ObjectId,
    email: updateUser?.email as string,
    role: updateUser?.role as 'admin' | 'user',
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as TExpiresIn,
  )

  return { accessToken }
}

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found')
  }

  const otp = generateOtp()
  const expiresAt = moment().add(5, 'minute')

  // Save OTP in Redis cache with 5 minutes TTL (300 seconds)
  await OtpRedisService.saveOtp(user.email, otp, 300)

  const jwtPayload = {
    email: user?.email,
    userId: user?._id,
  }
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '5m',
  })

  // Enqueue verification email to background worker
  const emailQueue = getEmailQueue()
  await emailQueue.add(
    'send-verification-email',
    {
      email: user.email,
      name: user.name,
      otp,
      expiresAt: expiresAt.format('LT'),
    },
    { priority: 1, attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
  )

  return { token }
}

export const otpServices = {
  verifyOtp,
  resendOtp,
}
