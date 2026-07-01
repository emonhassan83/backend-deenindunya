import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TWaterIntake } from './waterIntake.interface'
import { WaterIntake } from './waterIntake.model'
import { User } from '../user/user.model'
import mongoose from 'mongoose'

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
  return result
}

const getAllFromDB = async (userId: string) => {
  const today = new Date().toLocaleDateString('en-CA') // '2026-04-26'

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
  const dailyGoalMl = 2500
  const progress = Math.min(
    Math.round((totalWaterToday / dailyGoalMl) * 100),
    100,
  )

  const waterLogs = await WaterIntake.find({ user: userId, logAt: today }).select('amountMl logAt')
    .sort({ logAt: -1, createdAt: -1 })
    .lean()

  return {
    totalWaterToday,
    progress,
    waterLogs,
  }
}

export const WaterIntakeService = {
  insertIntoDB,
  getAllFromDB,
}
