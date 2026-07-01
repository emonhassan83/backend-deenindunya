export const REDIS_PREFIXES = {
  otp: 'user:otp',
  blacklist: 'blacklist:token',
  user: 'user',
  settings: 'settings',
  notification: 'notification',
  unreadNotification: 'user:unread:notification',
  session: 'session',
  rateLimit: 'rate:limit',
  contents: 'contents',
} as const
