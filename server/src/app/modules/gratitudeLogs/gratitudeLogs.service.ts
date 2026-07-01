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
import mongoose from 'mongoose'

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

const getAllFromDB = async (userId: string) => {
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
