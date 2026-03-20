import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TMoodLogs } from './moodLogs.interface'
import { MoodLog } from './moodLogs.model'
import { User } from '../user/user.model'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from 'date-fns'

const insertIntoDB = async (
  payload: TMoodLogs,
  userId: string
): Promise<TMoodLogs> => {
  // Validate user exists
  const userExists = await User.findById(userId)
  if (!userExists || userExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Assign user to payload
  payload.user = userExists._id

  // If date is not provided, use current date
  const logDate = payload.logDate ? new Date(payload.logDate) : new Date()
  
  // Get start and end of the day for the log date
  const startOfLogDate = startOfDay(logDate)
  const endOfLogDate = endOfDay(logDate)

  // 🎯 KEY LOGIC: Check if mood log already exists for this day
  const existingLog = await MoodLog.findOne({
    user: userExists._id,
    logDate: {
      $gte: startOfLogDate,
      $lte: endOfLogDate,
    },
    isDeleted: false,
  })

  // If exists, UPDATE the existing log (replace mood)
  if (existingLog) {
    const updated = await MoodLog.findByIdAndUpdate(
      existingLog._id,
      {
        mood: payload.mood,
        logDate: logDate, // Update with new timestamp
      },
      { new: true }
    ).lean()

    if (!updated) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update mood log')
    }

    return updated
  }

  // If doesn't exist, CREATE new log
  const result = await MoodLog.create(payload)
  return result
}

const getAllFromDB = async (userId: string, query: Record<string, unknown>) => {
  const { dateFilter, startDate, endDate, page = 1, limit = 31 } = query

  const filter: Record<string, unknown> = {
    user: userId,
    isDeleted: false,
  }

  // Date filtering
  if (dateFilter) {
    const now = new Date()
    switch (dateFilter) {
      case 'today':
        filter.logDate = { $gte: startOfDay(now), $lte: endOfDay(now) }
        break
      case 'week':
        filter.logDate = { $gte: startOfWeek(now), $lte: endOfWeek(now) }
        break
      case 'month':
        filter.logDate = { $gte: startOfMonth(now), $lte: endOfMonth(now) }
        break
      case 'last7days':
        filter.logDate = { $gte: subDays(now, 7), $lte: now }
        break
      case 'last30days':
        filter.logDate = { $gte: subDays(now, 30), $lte: now }
        break
    }
  }

  // Custom date range
  if (startDate && endDate) {
    filter.logDate = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    }
  }

  const skip = (Number(page) - 1) * Number(limit)

  const result = await MoodLog.find(filter)
    .select('-isDeleted')
    .skip(skip)
    .limit(Number(limit))
    .sort({ logDate: -1 })
    .lean()

  const total = await MoodLog.countDocuments(filter)

  // Get today's mood
  const todayMood = await MoodLog.findOne({
    user: userId,
    logDate: {
      $gte: startOfDay(new Date()),
      $lte: endOfDay(new Date()),
    },
    isDeleted: false,
  }).lean()

  // Get mood frequency (most common moods)
  const moodFrequency = await MoodLog.aggregate([
    { $match: { user: userId, isDeleted: false } },
    { $group: { _id: '$mood', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ])

  // Get current streak (consecutive days with mood logs)
  const allLogs = await MoodLog.find({
    user: userId,
    isDeleted: false,
  })
    .select('logDate')
    .sort({ logDate: -1 })
    .lean()

  let currentStreak = 0
  let checkDate = startOfDay(new Date())

  for (const log of allLogs) {
    const logDay = startOfDay(new Date(log.logDate))
    
    if (logDay.getTime() === checkDate.getTime()) {
      currentStreak++
      checkDate = startOfDay(subDays(checkDate, 1))
    } else if (logDay.getTime() < checkDate.getTime()) {
      // Gap found, streak broken
      break
    }
  }

  return {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      todayMood: todayMood?.mood || null,
      todayLogged: !!todayMood,
      moodFrequency,
      currentStreak,
    },
  }
}

export const MoodLogsService = {
  insertIntoDB,
  getAllFromDB,
}