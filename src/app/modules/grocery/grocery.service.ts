import mongoose from 'mongoose'
import httpStatus from 'http-status'
import { TGrocery } from './grocery.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Grocery } from './grocery.models'
import QueryBuilder from '../../builder/QueryBuilder'
import moment from 'moment'

// Create grocery item
const insertIntoDB = async (payload: TGrocery, userId: string, userTimeZone: string = 'Asia/Dhaka') => {
  const { name } = payload

  const user = await User.findById(userId);
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }
  if (!user.timezone) {
    throw new AppError(httpStatus.NOT_FOUND, 'User has no timezone set yet')
  }
  
  // Get current date in user's timezone
  const nowInUserTZ = moment.tz(user.timezone)
  const todayStr = nowInUserTZ.format('YYYY-MM-DD')
  
  // Check if item already exists for today
  const exists = await Grocery.findOne({
    user: userId,
    name: name,
    logAt: todayStr,
  })
  
  if (exists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Item already exists for today')
  }
  
  const result = await Grocery.create({
    user: userId,
    name: name,
    logAt: todayStr,
    isCompleted: false,
    userTimeZone: user.timezone,
  })
  
  return result
}

// Get all grocery items (no pagination)
const getAllIntoDB = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }
  if (!user.timezone) {
    throw new AppError(httpStatus.NOT_FOUND, 'User has no timezone set yet')
  }

  // Get current date in user's timezone
  const nowInUserTZ = moment.tz(user.timezone)
  const todayStr = nowInUserTZ.format('YYYY-MM-DD')
  
  // Get all incomplete grocery items for today (based on user's timezone)
  const data = await Grocery.find({
    user: userId,
    logAt: todayStr,
    isCompleted: false,
  }).sort({ createdAt: -1 }).lean()
  
  // Calculate statistics
  const completedCount = await Grocery.countDocuments({
    user: userId,
    logAt: todayStr,
    isCompleted: true,
  })
  
  const totalCount = data.length + completedCount
  
  return {
    data,
    meta: {
      total: totalCount,
      completed: completedCount,
      incomplete: data.length,
      date: todayStr
    },
  }
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
