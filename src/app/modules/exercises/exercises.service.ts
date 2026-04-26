import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TExercise } from './exercises.interface'
import { Exercise } from './exercises.model'
import { User } from '../user/user.model'
import mongoose from 'mongoose'
import moment from 'moment'

const insertIntoDB = async (
  payload: TExercise,
  userId: string,
): Promise<TExercise> => {
  // Validate user exists
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Assign user to payload
  payload.user = user._id

  // Create new exercise
  const result = await Exercise.create(payload)
  return result
}

const getAllFromDB = async (userId: string) => {
  // 1. Fetch user to get timezone (optional)
  const user = await User.findById(userId).select('timezone').lean()
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }
  const timezone = user?.timezone || 'Asia/Dhaka' // default

  const today = new Date().toLocaleDateString('en-CA') // '2026-04-26'

  // 3. Get all exercises for today
  const todayExercises = await Exercise.find({
    user: userId,
    logAt: today,
  }).select('name reps category isCompleted logAt').lean()

  // 4. Compute stats
  const total = todayExercises.length
  const completed = todayExercises.filter((ex) => ex.isCompleted).length
  const incomplete = total - completed
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  // 5. Compute continuous streak (rawExercise)
  // Get all distinct dates with at least one exercise log (any completion status)
  const allLogDates = await Exercise.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$logAt' } },
    { $sort: { _id: -1 } }, // descending by date
  ])
  const dateSet = new Set(allLogDates.map((d) => d._id))

  let streak = 0
  let currentDate = moment().tz(timezone)
  while (true) {
    const dateStr = currentDate.format('YYYY-MM-DD')
    if (dateSet.has(dateStr)) {
      streak++
      currentDate.subtract(1, 'day')
    } else {
      break
    }
  }

  // 6. Return simplified response
  return {
    completedExercise: completed,
    incompleteExercise: incomplete,
    progress,
    rawExercise: streak,
    exercise: todayExercises,
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
