import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Prayer } from './prayer.models'
import { TPrayer } from './prayer.interface'
import {
  calculatePrayerTimes,
  getNotifyAtTime,
  getNotifyAtISO,
  getTodayInTimezone,
  resolvePrayerTimezone,
} from '../../utils/prayerTimes'
import { calculateCurrentStreak, calculateLongestStreak } from './prayer.utils'
import dayjs from 'dayjs'
import { isValidDate } from '../../utils/isValidDate'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'
import {
  DEFAULT_PRAYER_REMINDER_SETTINGS,
  PRAYER_NAME,
  PRAYER_NOTIFICATION_COPY,
  TPrayerName,
} from './prayer.constants'
import { PrayerReminderSetting } from './prayerReminder.model'
import {
  TPrayerReminderPref,
  TPrayerReminderSettingsMap,
} from './prayerReminder.interface'

const PRAYER_NAMES = Object.values(PRAYER_NAME) as TPrayerName[]

// Create 5 prayers for a specific date
const createBulkPrayers = async (userId: string, payload: { date: string }) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const { date } = payload

  // Default prayer names
  const prayerNames: TPrayer['name'][] = PRAYER_NAMES

  // Check if prayers already exist for this date
  const existingPrayers = await Prayer.find({
    user: userId,
    date,
  })

  if (existingPrayers.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Prayers already exist for this date',
    )
  }

  // Create prayer documents
  const prayerDocs = prayerNames.map((name, index) => {
    return {
      user: userId,
      name,
      date,
    }
  })

  const result = await Prayer.insertMany(prayerDocs)
  if (!result || result.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Prayers creation failed')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.PRAYER_PATTERN(userId))

  return result
}

const getPrayersByDate = async (userId: string, query: Record<string, any>) => {
  const { date } = query

  // Validate date is provided
  if (!date) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Date is required. Please provide date in YYYY-MM-DD format',
    )
  }

  // Validate date format
  if (!isValidDate(date)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid date format. Please use YYYY-MM-DD format (e.g., 2026-04-22)',
    )
  }

  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const cacheKey = REDIS_KEYS.PRAYER_DATA(userId, date)
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Get prayer times for the date
  const prayerTimes = await getPrayerTimes(userId, { date })

  // Get prayers from database
  const prayers = await Prayer.find({
    user: userId,
    date,
  }).sort({ name: 1 })

  // Create prayer list with prayer times
  const prayerNames = PRAYER_NAMES

  const prayersWithTimes = prayerNames.map((name) => {
    const existingPrayer = prayers.find((p) => p.name === name)

    return {
      name: name,
      date: date,
      prayed: existingPrayer ? existingPrayer.prayed : false,
      prayerTime: prayerTimes[name as keyof typeof prayerTimes] || 'N/A',
      _id: existingPrayer?._id || null,
    }
  })

  // Calculate statistics
  const totalPrayers = prayersWithTimes.length
  const completedPrayers = prayersWithTimes.filter((p) => p.prayed).length
  const completionRate =
    totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0

  // Calculate current streak (based on consecutive days of all prayers completed)
  const currentStreak = await calculateCurrentStreak(userId)

  // Calculate longest streak
  const longestStreak = await calculateLongestStreak(userId)

  const result = {
    date,
    completedPrayers,
    totalPrayers,
    completionRate: parseFloat(completionRate.toFixed(2)),
    currentStreak,
    longestStreak,
    prayers: prayersWithTimes,
  }

  await setCache(cacheKey, result)

  return result
}

// Toggle prayer completion status by prayer name for a specific date
const togglePrayerStatus = async (
  prayerName: string,
  userId: string,
  query: Record<string, any>,
) => {
  const { date } = query

  if (!date) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Date is required. Please provide date in YYYY-MM-DD format',
    )
  }

  if (!isValidDate(date)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid date format. Please use YYYY-MM-DD format (e.g., 2026-04-22)',
    )
  }

  if (!PRAYER_NAMES.includes(prayerName as TPrayerName)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid prayer name. Allowed values are: ${PRAYER_NAMES.join(', ')}`,
    )
  }
  const validPrayerName = prayerName as TPrayerName

  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const prayer = await Prayer.findOne({
    user: userId,
    name: validPrayerName,
    date,
  })

  if (!prayer) {
    const result = await Prayer.create({
      user: userId,
      name: validPrayerName,
      date,
      prayed: true,
      prayedAt: new Date(),
    })

    await deleteCachePattern(REDIS_KEYS.PRAYER_PATTERN(userId))

    return result
  }

  const updatedStatus = !prayer.prayed
  const updateData = updatedStatus
    ? { $set: { prayed: true, prayedAt: new Date() } }
    : { $set: { prayed: false }, $unset: { prayedAt: '' } }

  const result = await Prayer.findOneAndUpdate(
    { user: userId, name: validPrayerName, date },
    updateData,
    { returnDocument: 'after' },
  )

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Prayer status update failed!',
    )
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.PRAYER_PATTERN(userId))

  return result
}

// Complete all prayers for a specific date
const completedPayers = async (userId: string, query: Record<string, any>) => {
  const { date } = query

  // Validate date is provided
  if (!date) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Date is required. Please provide date in YYYY-MM-DD format',
    )
  }

  // Validate date format
  if (!isValidDate(date)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid date format. Please use YYYY-MM-DD format (e.g., 2026-04-22)',
    )
  }

  // Validate user exists
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // List of all prayers
  const prayerNames = PRAYER_NAMES

  // অপ্টিমাইজেশন: লুপের ভেতর বারবার ডাটাবেজ কোয়েরি না করে Promise.all ব্যবহার করা হয়েছে
  await Promise.all(
    prayerNames.map((prayerName) => {
      const filter = {
        user: userId,
        name: prayerName,
        date: date,
      } as any

      const update = {
        $set: {
          user: userId,
          name: prayerName,
          date: date,
          prayed: true,
        },
      } as any

      return Prayer.findOneAndUpdate(filter, update, {
        upsert: true,
        returnDocument: 'after',
      })
    }),
  )

  // Get all prayers for the date to return
  const prayers = await Prayer.find({
    user: userId,
    date: date,
  } as any).sort({ name: 1 })

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.PRAYER_PATTERN(userId))

  return {
    prayers: prayers.map((p) => ({
      _id: p._id,
      name: p.name,
      date: p.date,
      prayed: p.prayed,
    })),
  }
}

// Get prayer times based on user latitude and longitude
const getPrayerTimes = async (userId: string, query: Record<string, any>) => {
  const { latitude, longitude, timezone, date } = query

  // Use provided coordinates or get from user profile
  let finalLat = latitude
  let finalLng = longitude
  let finalTimezone = timezone

  if (!latitude || !longitude) {
    const user = await User.findById(userId)
    if (!user || user.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
    }

    // Default coordinates if not set in user profile
    finalLat = user.latitude || 23.8103
    finalLng = user.longitude || 90.4125
    finalTimezone = user.timezone || 'Asia/Dhaka'
  }

  // Validate coordinates
  const lat = parseFloat(finalLat)
  const lng = parseFloat(finalLng)

  if (isNaN(lat) || isNaN(lng)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid coordinates')
  }

  if (date && !isValidDate(date)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid date format. Use YYYY-MM-DD',
    )
  }

  const tz = resolvePrayerTimezone(finalTimezone)
  const isoDate = date || getTodayInTimezone(tz)
  const targetDate = dayjs(isoDate).format('DD-MM-YYYY')

  const cacheKey = REDIS_KEYS.PRAYER_TIMES(userId, targetDate)
  const cachedTimes = await getCache<any>(cacheKey)
  if (cachedTimes) {
    return cachedTimes
  }

  const times = calculatePrayerTimes({
    latitude: lat,
    longitude: lng,
    date: isoDate,
    timezone: tz,
  })

  const settings = await getOrCreateReminderSettings(userId)
  const reminders = buildReminderPayload(times, settings, isoDate, tz)

  const prayerTimes = {
    ...times,
    location: {
      latitude: lat,
      longitude: lng,
      timezone: tz,
    },
    reminders,
  }

  await setCache(cacheKey, prayerTimes)

  return prayerTimes
}

const toReminderSettingsMap = (
  doc: InstanceType<typeof PrayerReminderSetting>,
): TPrayerReminderSettingsMap => ({
  fajr: { enabled: doc.fajr.enabled, offsetMinutes: doc.fajr.offsetMinutes },
  dhuhr: { enabled: doc.dhuhr.enabled, offsetMinutes: doc.dhuhr.offsetMinutes },
  asr: { enabled: doc.asr.enabled, offsetMinutes: doc.asr.offsetMinutes },
  maghrib: {
    enabled: doc.maghrib.enabled,
    offsetMinutes: doc.maghrib.offsetMinutes,
  },
  isha: { enabled: doc.isha.enabled, offsetMinutes: doc.isha.offsetMinutes },
})

const getOrCreateReminderSettings = async (userId: string) => {
  let settings = await PrayerReminderSetting.findOne({ user: userId })
  if (!settings) {
    settings = await PrayerReminderSetting.create({
      user: userId,
      ...DEFAULT_PRAYER_REMINDER_SETTINGS,
    })
  }
  return toReminderSettingsMap(settings)
}

const getReminderSettings = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }
  return getOrCreateReminderSettings(userId)
}

const updateReminderSettings = async (
  userId: string,
  payload: Partial<Record<TPrayerName, Partial<TPrayerReminderPref>>>,
) => {
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  await getOrCreateReminderSettings(userId)

  const update: Record<string, unknown> = {}
  for (const prayer of PRAYER_NAMES) {
    const pref = payload[prayer]
    if (!pref) continue
    if (typeof pref.enabled === 'boolean') {
      update[`${prayer}.enabled`] = pref.enabled
    }
    if (typeof pref.offsetMinutes === 'number') {
      update[`${prayer}.offsetMinutes`] = pref.offsetMinutes
    }
  }

  const settings = await PrayerReminderSetting.findOneAndUpdate(
    { user: userId },
    { $set: update },
    { new: true },
  )

  await deleteCachePattern(REDIS_KEYS.PRAYER_PATTERN(userId))

  return toReminderSettingsMap(settings!)
}

export const buildReminderPayload = (
  times: {
    fajr: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
  },
  settings: TPrayerReminderSettingsMap,
  date: string,
  timezone?: string | null,
) => {
  const reminders: Record<
    TPrayerName,
    {
      enabled: boolean
      offsetMinutes: number
      prayerTime: string
      notifyAt: string
      notifyTime?: string
      title: string
      body: string
    }
  > = {} as any

  for (const prayer of PRAYER_NAMES) {
    const pref = settings[prayer]
    const prayerTime = times[prayer]
    const copy = PRAYER_NOTIFICATION_COPY[prayer]
    reminders[prayer] = {
      enabled: pref.enabled,
      offsetMinutes: pref.offsetMinutes,
      prayerTime,
      notifyAt: getNotifyAtISO(prayerTime, pref.offsetMinutes, date, timezone),
      notifyTime: getNotifyAtTime(
        prayerTime,
        pref.offsetMinutes,
        date,
        timezone,
      ),
      title: copy.title,
      body: copy.body,
    }
  }

  return reminders
}

export const PrayerService = {
  createBulkPrayers,
  getPrayersByDate,
  togglePrayerStatus,
  getPrayerTimes,
  completedPayers,
  getReminderSettings,
  updateReminderSettings,
}
