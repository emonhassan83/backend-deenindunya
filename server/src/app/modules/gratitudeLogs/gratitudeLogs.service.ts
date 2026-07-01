import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TGratitudeLogs } from './gratitudeLogs.interface'
import { GratitudeLog } from './gratitudeLogs.model'
import { User } from '../user/user.model'
import mongoose from 'mongoose'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.GRATITUDE(userId))

  return result
}

const getAllFromDB = async (userId: string) => {
  const cacheKey = REDIS_KEYS.GRATITUDE(userId)
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const user = await User.findById(userId).select('_id').lean()
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Calculate date 7 days ago
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)

  // Format dates as YYYY-MM-DD strings
  const formatDate = (date: Date) => date.toISOString().slice(0, 10)

  const logs = await GratitudeLog.find({
    user: new mongoose.Types.ObjectId(userId),
    logAt: {
      $gte: formatDate(sevenDaysAgo),
      $lte: formatDate(today),
    },
  }).select('type title logAt')
    .sort({ logAt: -1, createdAt: -1 })
    .lean()

  await setCache(cacheKey, logs)

  return logs
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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.GRATITUDE(userId))

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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.GRATITUDE(userId))

  return result
}

export const GratitudeLogsService = {
  insertIntoDB,
  getAllFromDB,
  updateIntoDB,
  deleteFromDB,
}
