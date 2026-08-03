import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TWaterIntake } from './waterIntake.interface'
import { WaterIntake } from './waterIntake.model'
import { User } from '../user/user.model'
import mongoose from 'mongoose'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

const insertIntoDB = async (
  payload: TWaterIntake,
  userId: string,
): Promise<TWaterIntake> => {
  // Validate user exists
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Assign user to payload
  payload.user = user._id

  // Create new water intake record
  const result = await WaterIntake.create(payload)

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.WATER_INTAKE(userId))

  return result
}

const getAllFromDB = async (userId: string) => {
  const cacheKey = REDIS_KEYS.WATER_INTAKE(userId)
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const today = new Date().toLocaleDateString('en-CA') // '2026-04-26'
  const user = await User.findById(userId).select('dailyGoalMl isDeleted')
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Convert userId to ObjectId for aggregation
  const userObjectId = new mongoose.Types.ObjectId(userId)

  const totalWaterTodayResult = await WaterIntake.aggregate([
    {
      $match: {
        user: userObjectId, // now correct type
        logAt: today,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amountMl' },
      },
    },
  ])

  const totalWaterToday = totalWaterTodayResult[0]?.total || 0
  const dailyGoalMl = user.dailyGoalMl || 2500
  const progress = Math.min(
    Math.round((totalWaterToday / dailyGoalMl) * 100),
    100,
  )
  const remainingMl = Math.max(dailyGoalMl - totalWaterToday, 0)

  const waterLogs = await WaterIntake.find({ user: userId, logAt: today }).select('amountMl logAt')
    .sort({ logAt: -1, createdAt: -1 })
    .lean()

  const result = {
    dailyGoalMl,
    totalWaterToday,
    remainingMl,
    progress,
    isGoalAchieved: totalWaterToday >= dailyGoalMl,
    waterLogs,
  }

  await setCache(cacheKey, result)

  return result
}

const setDailyTarget = async (
  userId: string,
  payload: { dailyGoalMl: number },
) => {
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  const result = await User.findByIdAndUpdate(
    userId,
    { dailyGoalMl: payload.dailyGoalMl },
    { new: true, runValidators: true },
  ).select('dailyGoalMl')

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Daily water target update failed')
  }

  await deleteCachePattern(REDIS_KEYS.WATER_INTAKE(userId))

  return {
    dailyGoalMl: result.dailyGoalMl,
  }
}

export const WaterIntakeService = {
  insertIntoDB,
  getAllFromDB,
  setDailyTarget,
}
