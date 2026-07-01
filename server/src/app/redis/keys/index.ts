import { REDIS_PREFIXES } from '../../constant'
import { createRedisKey } from '../../utils/createRedisKey'

export const REDIS_KEYS = {
  // Content cache keys
  CONTENT_BY_KEY: (key: string) => createRedisKey(REDIS_PREFIXES.contents, key),
  CONTENT_GENERALS: createRedisKey(REDIS_PREFIXES.contents, 'generals'),
  CONTENT_PATTERN: createRedisKey(REDIS_PREFIXES.contents, '*'),

  // Notification and OTP keys
  UNREAD_NOTIFICATION: (userId: string) => createRedisKey(REDIS_PREFIXES.unreadNotification, userId),
  REGISTER_OTP: (email: string) => createRedisKey(REDIS_PREFIXES.otp, email),
  RESET_OTP: (email: string) => createRedisKey(REDIS_PREFIXES.otp, 'reset', email),

  // Settings keys
  SETTINGS_SINGLE: (key: string) => createRedisKey(REDIS_PREFIXES.settings, key),
  SETTINGS_GENERALS: createRedisKey(REDIS_PREFIXES.settings, 'generals')
} as const
