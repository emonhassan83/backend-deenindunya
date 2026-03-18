import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TGratitudeLogs } from './gratitudeLogs.interface'
import { GratitudeLog } from './gratitudeLogs.model'
import { User } from '../user/user.model'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from 'date-fns'

const insertIntoDB = async (
  payload: TGratitudeLogs,
  userId: string,
): Promise<TGratitudeLogs> => {
  // Validate user exists
  const userExists = await User.findById(userId)
  if (!userExists || userExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Assign user to payload
  payload.user = userExists._id

  // Create new gratitude log
  const result = await GratitudeLog.create(payload)
  return result
}

const getAllFromDB = async (userId: string, query: Record<string, unknown>) => {
  const { type, search, dateFilter, page = 1, limit = 10 } = query

  const filter: Record<string, unknown> = {
    user: userId,
    isDeleted: false,
  }

  // Filter by type
  if (type) {
    filter.type = type
  }

  // Date filtering
  if (dateFilter) {
    const now = new Date()
    switch (dateFilter) {
      case 'today':
        filter.createdAt = { $gte: startOfDay(now), $lte: endOfDay(now) }
        break
      case 'week':
        filter.createdAt = { $gte: startOfWeek(now), $lte: endOfWeek(now) }
        break
      case 'month':
        filter.createdAt = { $gte: startOfMonth(now), $lte: endOfMonth(now) }
        break
      case 'last7days':
        filter.createdAt = { $gte: subDays(now, 7), $lte: now }
        break
      case 'last30days':
        filter.createdAt = { $gte: subDays(now, 30), $lte: now }
        break
    }
  }

  // Search functionality
  if (search) {
    filter.$text = { $search: search as string }
  }

  const skip = (Number(page) - 1) * Number(limit)

  const result = await GratitudeLog.find(filter)
    .select('-isDeleted')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean()

  const total = await GratitudeLog.countDocuments(filter)

  // Get stats by type
  const typeStats = await GratitudeLog.aggregate([
    { $match: { user: userId, isDeleted: false } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ])

  // Get total entries
  const totalEntries = await GratitudeLog.countDocuments({
    user: userId,
    isDeleted: false,
  })

  // Get entries this month
  const thisMonthEntries = await GratitudeLog.countDocuments({
    user: userId,
    isDeleted: false,
    createdAt: {
      $gte: startOfMonth(new Date()),
      $lte: endOfMonth(new Date()),
    },
  })

  return {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      totalEntries,
      thisMonthEntries,
      typeStats,
    },
  }
}

const updateIntoDB = async (
  id: string,
  userId: string,
  payload: Partial<TGratitudeLogs>,
): Promise<TGratitudeLogs> => {
  // Check if log exists and belongs to user
  const existing = await GratitudeLog.findOne({
    _id: id,
    user: userId,
  })

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gratitude log not found!')
  }

  const updated = await GratitudeLog.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .select('-isDeleted')
    .lean()

  if (!updated) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update gratitude log')
  }

  return updated
}

const deleteFromDB = async (
  id: string,
  userId: string,
): Promise<TGratitudeLogs> => {
  const existing = await GratitudeLog.findOne({
    _id: id,
    user: userId,
  })

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gratitude log not found!')
  }

  const result = await GratitudeLog.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Gratitude log deletion failed!')
  }

  return result
}

export const GratitudeLogsService = {
  insertIntoDB,
  getAllFromDB,
  updateIntoDB,
  deleteFromDB,
}
