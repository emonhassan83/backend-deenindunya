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
  REGISTER_OTP_VERIFIED: (email: string) => createRedisKey(REDIS_PREFIXES.otp, 'verified', email),
  RESET_OTP: (email: string) => createRedisKey(REDIS_PREFIXES.otp, 'reset', email),
  RESET_OTP_VERIFIED: (email: string) => createRedisKey(REDIS_PREFIXES.otp, 'reset:verified', email),

  // Settings keys
  SETTINGS_SINGLE: (key: string) => createRedisKey(REDIS_PREFIXES.settings, key),
  SETTINGS_GENERALS: createRedisKey(REDIS_PREFIXES.settings, 'generals'),

  // Reminder keys
  REMINDER_KEY: (userId: string, date: string) => createRedisKey('reminder', userId, date),
  REMINDER_PATTERN: (userId: string) => createRedisKey('reminder', userId, '*'),

  // Task keys
  TASK_KEY: (userId: string, type: string) => createRedisKey('task', userId, type),
  TASK_PATTERN: (userId: string) => createRedisKey('task', userId, '*'),

  // Event keys
  EVENT_ALL: (queryString: string) => createRedisKey('event:all', queryString),
  EVENT_USER_ALL: (userId: string, queryString: string) => createRedisKey('event:user', userId, 'all', queryString),
  EVENT_USER_DATE: (userId: string, date: string) => createRedisKey('event:user', userId, 'date', date),
  EVENT_USER_MONTH: (userId: string, yearMonth: string) => createRedisKey('event:user', userId, 'month', yearMonth),
  EVENT_ISLAMIC_YEAR: (year: string) => createRedisKey('event:islamic:year', year),
  EVENT_PATTERN: 'event:*',

  // Grocery keys
  GROCERY_KEY: (userId: string, date: string) => createRedisKey('grocery', userId, date),
  GROCERY_PATTERN: (userId: string) => createRedisKey('grocery', userId, '*'),

  // Room keys
  ROOM_KEY: (userId: string, date: string) => createRedisKey('room', userId, date),
  ROOM_PATTERN: (userId: string) => createRedisKey('room', userId, '*'),

  // Prayer keys
  PRAYER_DATA: (userId: string, date: string) => createRedisKey('prayer:data', userId, date),
  PRAYER_TIMES: (userId: string, date: string) => createRedisKey('prayer:times', userId, date),
  PRAYER_PATTERN: (userId: string) => createRedisKey('prayer', '*', userId, '*'),

  // Sunnah keys
  SUNNAH_USER: (userId: string, queryString: string) => createRedisKey('sunnah:user', userId, queryString),
  SUNNAH_ADMIN: (queryString: string) => createRedisKey('sunnah:admin', queryString),
  SUNNAH_USER_PATTERN: (userId: string) => createRedisKey('sunnah:user', userId, '*'),
  SUNNAH_GLOBAL_PATTERN: 'sunnah:*',

  // Dua keys
  DUA_ALL: (queryString: string) => createRedisKey('dua:all', queryString),
  DUA_SINGLE: (id: string) => createRedisKey('dua:single', id),
  DUA_PATTERN: 'dua:*',

  // Surah keys
  SURAH_LIST: (userId: string, queryString: string) => createRedisKey('surah:list', userId, queryString),
  SURAH_VERSES: (surahNum: string, queryString: string) => createRedisKey('surah:verses', surahNum, queryString),
  SURAH_USER_PATTERN: (userId: string) => createRedisKey('surah:list', userId, '*'),

  // Water Intake keys
  WATER_INTAKE: (userId: string) => createRedisKey('waterIntake', userId),

  // Exercise keys
  EXERCISE: (userId: string) => createRedisKey('exercise', userId),

  // Gratitude keys
  GRATITUDE: (userId: string) => createRedisKey('gratitude', userId),

  // Affirmation keys
  AFFIRMATION_ALL: (queryString: string) => createRedisKey('affirmation:all', queryString),
  AFFIRMATION_SINGLE: (id: string) => createRedisKey('affirmation:single', id),
  AFFIRMATION_PATTERN: 'affirmation:*',

  // Ambition keys
  AMBITION: (userId: string) => createRedisKey('ambition', userId),

  // Education Hub keys
  EDU_MODULES: (userId: string) => createRedisKey('edu:modules', userId),
  EDU_LESSONS_TYPE: (userId: string, type: string) => createRedisKey('edu:lessons:type', userId, type),
  EDU_LESSONS_MODULE: (userId: string, moduleId: string) => createRedisKey('edu:lessons:module', userId, moduleId),
  EDU_PATTERN: (userId: string) => createRedisKey('edu', '*', userId, '*'),

  // Meta keys
  VERSE_OF_DAY: (date: string) => createRedisKey('meta:verse-of-day', date),
  ADHKAR_MORNING: (date: string) => createRedisKey('meta:adhkar:morning', date),
  ADHKAR_EVENING: (date: string) => createRedisKey('meta:adhkar:evening', date),
} as const
