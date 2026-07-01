import mongoose from 'mongoose'
import httpStatus from 'http-status'
import { TGrocery } from './grocery.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Grocery } from './grocery.models'
import { isValidDate } from '../../utils/isValidDate'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'

// Create grocery item
const insertIntoDB = async (payload: TGrocery, userId: string) => {
  const { name, logAt } = payload

  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Check if item already exists for today
  const exists = await Grocery.findOne({
    user: userId,
    name: name,
    logAt: logAt,
  })

  if (exists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Item already exists for today')
  }

  // save user record
  payload.user = user._id

  const result = await Grocery.create({
    user: userId,
    name: name,
    logAt: logAt,
    isCompleted: false,
  })

  // Invalidate cache
  await deleteCachePattern(`grocery:${userId}:*`)

  return result
}

// Get all grocery items (no pagination)
const getAllIntoDB = async (query: Record<string, any>, userId: string) => {
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
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  const cacheKey = `grocery:${userId}:${date}`
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Get all grocery items for the date (both completed and incomplete)
  const items = await Grocery.find({
    user: userId,
    logAt: date,
  })
    .sort({ createdAt: -1 })
    .select('name logAt isCompleted')
    .lean()

  // Calculate statistics
  const total = items.length
  const completed = items.filter((item) => item.isCompleted === true).length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const result = {
    total,
    completed,
    progress,
    items,
  }

  await setCache(cacheKey, result)

  return result
}

// Toggle Grocery status
const changedStatusIntoDB = async (id: string, userId: string) => {
  const grocery = await Grocery.findOne({ _id: id, user: userId })
  if (!grocery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Grocery not found!')
  }

  const updatedStatus = !grocery.isCompleted
  const result = await Grocery.findByIdAndUpdate(
    id,
    { isCompleted: updatedStatus },
    { new: true },
  )
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Grocery record not updated!',
    )
  }

  // Invalidate cache
  await deleteCachePattern(`grocery:${userId}:*`)

  return result
}

// Delete Grocery
const deleteAIntoDB = async (id: string) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const grocery = await Grocery.findById(id).session(session)
    if (!grocery) {
      throw new AppError(httpStatus.NOT_FOUND, 'Grocery not found!')
    }

    // Delete the Grocery
    const result = await Grocery.findByIdAndDelete(id).session(session)
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Grocery deletion failed')
    }

    await session.commitTransaction()
    session.endSession()

    // Invalidate cache
    await deleteCachePattern(`grocery:${grocery.user}:*`)

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

export const GroceryService = {
  insertIntoDB,
  getAllIntoDB,
  changedStatusIntoDB,
  deleteAIntoDB,
}
