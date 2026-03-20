import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TWaterIntake } from './waterIntake.interface'
import { WaterIntake } from './waterIntake.model'
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
  payload: TWaterIntake,
  userId: string,
): Promise<TWaterIntake> => {
  // Validate user exists
  const userExists = await User.findById(userId)
  if (!userExists || userExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Assign user to payload
  payload.user = userExists._id

  // Create new water intake record
  const result = await WaterIntake.create(payload)
  return result
}

const getAllFromDB = async (userId: string, query: Record<string, unknown>) => {
  const { dateFilter, startDate, endDate, page = 1, limit = 10 } = query

  const filter: Record<string, unknown> = {
    user: userId,
    isDeleted: false,
  }

  // Date filtering
  if (dateFilter) {
    const now = new Date()
    switch (dateFilter) {
      case 'today':
        filter.date = { $gte: startOfDay(now), $lte: endOfDay(now) }
        break
      case 'week':
        filter.date = { $gte: startOfWeek(now), $lte: endOfWeek(now) }
        break
      case 'month':
        filter.date = { $gte: startOfMonth(now), $lte: endOfMonth(now) }
        break
      case 'last7days':
        filter.date = { $gte: subDays(now, 7), $lte: now }
        break
      case 'last30days':
        filter.date = { $gte: subDays(now, 30), $lte: now }
        break
    }
  }

  // Custom date range
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    }
  }

  const skip = (Number(page) - 1) * Number(limit)

  const result = await WaterIntake.find(filter)
    .select('-isDeleted')
    .skip(skip)
    .limit(Number(limit))
    .sort({ date: -1 })
    .lean()

  const total = await WaterIntake.countDocuments(filter)

  // Calculate statistics
  const totalWaterToday = await WaterIntake.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        isDeleted: false,
      },
    },
    { $group: { _id: null, total: { $sum: '$amountMl' } } },
  ])

  const totalWaterThisWeek = await WaterIntake.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfWeek(new Date()), $lte: endOfWeek(new Date()) },
        isDeleted: false,
      },
    },
    { $group: { _id: null, total: { $sum: '$amountMl' } } },
  ])

  const totalWaterThisMonth = await WaterIntake.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfMonth(new Date()), $lte: endOfMonth(new Date()) },
        isDeleted: false,
      },
    },
    { $group: { _id: null, total: { $sum: '$amountMl' } } },
  ])

  // Average daily intake this month
  const averageDailyIntake = await WaterIntake.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfMonth(new Date()), $lte: endOfMonth(new Date()) },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        dailyTotal: { $sum: '$amountMl' },
      },
    },
    {
      $group: {
        _id: null,
        avgDaily: { $avg: '$dailyTotal' },
      },
    },
  ])

  return {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      totalWaterToday: totalWaterToday[0]?.total || 0,
      totalWaterThisWeek: totalWaterThisWeek[0]?.total || 0,
      totalWaterThisMonth: totalWaterThisMonth[0]?.total || 0,
      averageDailyIntake: Math.round(averageDailyIntake[0]?.avgDaily || 0),
      dailyGoal: 2000, // 2 liters = 2000ml (can be customizable per user)
      todayProgress: Math.round(
        ((totalWaterToday[0]?.total || 0) / 2000) * 100,
      ),
    },
  }
}

const deleteFromDB = async (
  id: string,
  userId: string,
): Promise<TWaterIntake> => {
  const existing = await WaterIntake.findOne({
    _id: id,
    user: userId,
  })

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Water intake record not found!')
  }

  const result = await WaterIntake.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  ).lean()

  if (!result) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Water intake record deletion failed!',
    )
  }

  return result
}

export const WaterIntakeService = {
  insertIntoDB,
  getAllFromDB,
  deleteFromDB,
}
