import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TAmbition } from './ambitions.interface'
import { Ambition } from './ambitions.model'
import { User } from '../user/user.model'

const insertIntoDB = async (
  payload: TAmbition,
  userId: string,
): Promise<TAmbition> => {
  // Validate user exists
  const userExists = await User.findById(userId)
  if (!userExists || userExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Assign user to payload
  payload.user = userExists._id

  // Create new ambition
  const result = await Ambition.create(payload)
  return result
}

const getAllFromDB = async (userId: string, query: Record<string, unknown>) => {
  const { type, isCompleted, search, page = 1, limit = 10 } = query

  const filter: Record<string, unknown> = {
    user: userId,
    isDeleted: false,
  }

  // Filter by type
  if (type) {
    filter.type = type
  }

  // Filter by completion status
  if (isCompleted !== undefined) {
    filter.isCompleted = isCompleted === 'true'
  }

  // Search functionality
  if (search) {
    filter.$text = { $search: search as string }
  }

  const skip = (Number(page) - 1) * Number(limit)

  const result = await Ambition.find(filter)
    .select('-isDeleted')
    .skip(skip)
    .limit(Number(limit))
    .sort({ isCompleted: 1, createdAt: -1 }) // Incomplete first, then by date
    .lean()

  const total = await Ambition.countDocuments(filter)

  // Get counts by completion status
  const completedCount = await Ambition.countDocuments({
    user: userId,
    isCompleted: true,
    isDeleted: false,
  })
  const incompleteCount = await Ambition.countDocuments({
    user: userId,
    isCompleted: false,
    isDeleted: false,
  })

  return {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      completedCount,
      incompleteCount,
    },
  }
}

const toggleCompleteStatus = async (
  id: string,
  userId: string,
): Promise<TAmbition> => {
  const existing = await Ambition.findOne({
    _id: id,
    user: userId,
  })

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ambition not found!')
  }

  const newStatus = !existing.isCompleted
  const updateData: Partial<TAmbition> = {
    isCompleted: newStatus,
    completedAt: newStatus ? new Date() : (null as any),
  }

  const updated = await Ambition.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .select('-isDeleted')
    .lean()

  if (!updated) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to toggle completion status',
    )
  }

  return updated
}

const deleteFromDB = async (id: string, userId: string): Promise<TAmbition> => {
  const existing = await Ambition.findOne({
    _id: id,
    user: userId,
  })

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ambition not found!')
  }

  const result = await Ambition.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Ambition deletion failed!')
  }

  return result
}

export const AmbitionService = {
  insertIntoDB,
  getAllFromDB,
  toggleCompleteStatus,
  deleteFromDB,
}
