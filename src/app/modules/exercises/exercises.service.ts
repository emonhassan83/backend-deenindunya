import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TExercise } from './exercises.interface'
import { Exercise } from './exercises.model'
import { User } from '../user/user.model'

const insertIntoDB = async (
  payload: TExercise,
  userId: string,
): Promise<TExercise> => {
  // Validate user exists
  const userExists = await User.findById(userId)
  if (!userExists || userExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Assign user to payload
  payload.user = userExists._id

  // Create new exercise
  const result = await Exercise.create(payload)
  return result
}

const getAllFromDB = async (userId: string, query: Record<string, unknown>) => {
  const { category, isCompleted, search, page = 1, limit = 10 } = query

  const filter: Record<string, unknown> = {
    user: userId,
    isDeleted: false,
  }

  // Filter by category
  if (category) {
    filter.category = category
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

  const result = await Exercise.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ isCompleted: 1, createdAt: -1 }) // Incomplete first
    .lean()

  const total = await Exercise.countDocuments(filter)

  // Get counts
  const completedCount = await Exercise.countDocuments({
    user: userId,
    isCompleted: true,
    isDeleted: false,
  })
  const incompleteCount = await Exercise.countDocuments({
    user: userId,
    isCompleted: false,
    isDeleted: false,
  })

  // Get total reps completed
  const totalRepsCompleted = await Exercise.aggregate([
    { $match: { user: userId, isCompleted: true, isDeleted: false } },
    { $group: { _id: null, totalReps: { $sum: '$reps' } } },
  ])

  // Get category breakdown
  const categoryStats = await Exercise.aggregate([
    { $match: { user: userId, isDeleted: false } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalReps: { $sum: '$reps' },
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
      completedCount,
      incompleteCount,
      totalRepsCompleted: totalRepsCompleted[0]?.totalReps || 0,
      categoryStats,
    },
  }
}

const updateIntoDB = async (
  id: string,
  userId: string,
  payload: Partial<TExercise>,
): Promise<TExercise> => {
  // Check if exercise exists and belongs to user
  const existing = await Exercise.findOne({
    _id: id,
    user: userId,
  })

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Exercise not found!')
  }

  const updated = await Exercise.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean()
  if (!updated) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update exercise')
  }

  return updated
}

const toggleCompleteStatus = async (
  id: string,
  userId: string,
): Promise<TExercise> => {
  const existing = await Exercise.findOne({
    _id: id,
    user: userId,
  })

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Exercise not found!')
  }

  const newStatus = !existing.isCompleted
  const updateData: Partial<TExercise> = {
    isCompleted: newStatus,
  }

  const updated = await Exercise.findByIdAndUpdate(id, updateData, {
    new: true,
  }).lean()

  if (!updated) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to toggle completion status',
    )
  }

  return updated
}

const deleteFromDB = async (id: string, userId: string): Promise<TExercise> => {
  const existing = await Exercise.findOne({
    _id: id,
    user: userId,
  })

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Exercise not found!')
  }

  const result = await Exercise.findByIdAndDelete(id).lean()
  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Exercise deletion failed!')
  }

  return result
}

export const ExerciseService = {
  insertIntoDB,
  getAllFromDB,
  updateIntoDB,
  toggleCompleteStatus,
  deleteFromDB,
}
