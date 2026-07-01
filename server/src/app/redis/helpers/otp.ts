import { getRedisClient } from '../../config/redis.config'
import { REDIS_KEYS } from '../keys'

export const OtpRedisService = {
  // Save OTP with expiration time in seconds
  saveOtp: async (email: string, otp: string, duration: number) => {
    await getRedisClient().set(REDIS_KEYS.REGISTER_OTP(email), otp, 'EX', duration)
  },

  // Get OTP
  getOtp: async (email: string) => {
    return await getRedisClient().get(REDIS_KEYS.REGISTER_OTP(email))
  },

  // Delete OTP
  deleteOtp: async (email: string) => {
    await getRedisClient().del(REDIS_KEYS.REGISTER_OTP(email))
  }
}
