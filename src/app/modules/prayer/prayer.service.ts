import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Prayer } from './prayer.models'
import {
  TPrayer,
} from './prayer.interface'
import axios from 'axios'
import { calculateCurrentStreak, calculateLongestStreak } from './prayer.utils'

// Create 5 prayers for a specific date
const createBulkPrayers = async (
  userId: string,
  payload: { date: string; prayers?: Partial<TPrayer>[] },
) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const { date, prayers } = payload

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

// Get prayers by date
const getPrayersByDate = async (userId: string, date: string) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }
  
  const prayers = await Prayer.find({
    user: userId,
    date,
  }).sort({ name: 1 })


  // Calculate total and completed prayers
  const totalPrayers = prayers.length
  const completedPrayers = prayers.filter(p => p.prayed).length
  const completionRate =
    totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0

  // Calculate current streak
  const currentStreak = calculateCurrentStreak(prayers)

  // Calculate longest streak
  const longestStreak = calculateLongestStreak(prayers)


   return {
    completedPrayers,
    completionRate: parseFloat(completionRate.toFixed(2)),
    currentStreak,
    longestStreak,
    prayers,
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

// Fetch prayer times based on location
const getPrayerTimes = async (
  userId: string,
  query: Record<string, any>
) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const { latitude, longitude, timezone } = user
  const { date } = query

  // Use current date if not provided
  const targetDate = date || new Date().toISOString().split('T')[0]

  try {
    // Using Aladhan API for prayer times
    const response = await axios.get(
      `https://api.aladhan.com/v1/timings/${targetDate}`,
      {
        params: {
          latitude,
          longitude,
          method: 2, // Islamic Society of North America (ISNA)
          ...(timezone && { timezone }),
        },
      },
    )

    if (response.data.code !== 200) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to fetch prayer times',
      )
    }

    const timings = response.data.data.timings

    const prayerTimes = {
      fajr: timings.Fajr,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      date: targetDate,
    }

    return prayerTimes
  } catch (error: any) {
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
  getPrayerTimes
}