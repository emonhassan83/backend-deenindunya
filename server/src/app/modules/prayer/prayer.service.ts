import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Prayer } from './prayer.models'
import { TPrayer } from './prayer.interface'
import axios from 'axios'
import { calculateCurrentStreak, calculateLongestStreak } from './prayer.utils'
import dayjs from 'dayjs'
import { isValidDate } from '../../utils/isValidDate'

// Create 5 prayers for a specific date
const createBulkPrayers = async (userId: string, payload: { date: string }) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const { date } = payload

  // Default prayer names
  const prayerNames: TPrayer['name'][] = [
    'fajr',
    'dhuhr',
    'asr',
    'maghrib',
    'isha',
  ]

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

  // Get prayer times for the date
  const prayerTimes = await getPrayerTimes(userId, { date })

  // Get prayers from database
  const prayers = await Prayer.find({
    user: userId,
    date,
  }).sort({ name: 1 })

  // Create prayer list with prayer times
  const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

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

  return {
    date,
    completedPrayers,
    totalPrayers,
    completionRate: parseFloat(completionRate.toFixed(2)),
    currentStreak,
    longestStreak,
    prayers: prayersWithTimes,
  }
}

// Toggle prayer completion status
const togglePrayerStatus = async (id: string, userId: string) => {
  const prayer = await Prayer.findOne({ _id: id, user: userId })
  if (!prayer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Prayer not found!')
  }

  const updatedStatus = !prayer.prayed
  const updateData: any = { prayed: updatedStatus }

  // Set prayedAt timestamp if marking as completed
  if (updatedStatus) {
    updateData.prayedAt = new Date()
  } else {
    updateData.prayedAt = null
  }

  const result = await Prayer.findByIdAndUpdate(id, updateData, { new: true })

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Prayer status update failed!',
    )
  }

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
  const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

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
  const prayers = await Prayer.find(
    {
      user: userId,
      date: date,
    } as any,
  ).sort({ name: 1 })

  return {
    prayers: prayers.map((p) => ({
      _id: p._id,
      name: p.name,
      date: p.date,
      prayed: p.prayed,
    })),
  }
}

// Fetch prayer times based on location
const getPrayerTimes = async (userId: string, query: Record<string, any>) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const { latitude, longitude, timezone } = user
  const { date } = query

  // Validate location data
  if (!latitude || !longitude) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Location not set. Please update your profile with latitude and longitude.',
    )
  }

  // 🔥 FIX: Convert date to DD-MM-YYYY format (Aladhan API expects this)
  let targetDate: string
  if (date) {
    // If date provided, parse and format
    targetDate = dayjs(date).format('DD-MM-YYYY')
  } else {
    // Use current date
    targetDate = dayjs().format('DD-MM-YYYY')
  }

  try {
    // Using Aladhan API for prayer times
    const response = await axios.get(
      `https://api.aladhan.com/v1/timings/${targetDate}`,
      {
        params: {
          latitude: latitude,
          longitude: longitude,
          method: 2, // ISNA calculation method
          ...(timezone && { timezonestring: timezone }),
        },
      },
    )

    if (response.data.code !== 200) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to fetch prayer times from Aladhan API',
      )
    }

    const timings = response.data.data.timings
    const dateInfo = response.data.data.date

    const prayerTimes = {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise, // Bonus
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      date: {
        readable: dateInfo.readable, // e.g., "25 Jan 2025"
        gregorian: dateInfo.gregorian.date, // e.g., "25-01-2025"
        hijri: dateInfo.hijri.date, // e.g., "24-07-1446"
      },
      location: {
        latitude,
        longitude,
        timezone: timezone || 'UTC',
      },
    }

    return prayerTimes
  } catch (error: any) {
    console.error('Prayer Times Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch prayer times',
    )
  }
}

export const PrayerService = {
  createBulkPrayers,
  getPrayersByDate,
  togglePrayerStatus,
  getPrayerTimes,
  completedPayers,
}
