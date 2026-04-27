import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TAmbition } from './ambitions.interface'
import { Ambition } from './ambitions.model'
import { User } from '../user/user.model'
import { AmbitionsType } from './ambitions.constant'

const insertIntoDB = async (
  payload: TAmbition,
  userId: string,
): Promise<TAmbition> => {
  // Validate user exists
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Assign user to payload
  payload.user = user._id

  // Create new ambition
  const result = await Ambition.create(payload)
  return result
}

const getAllFromDB = async (userId: string) => {
  // Get all ambitions for the user (not deleted)
  const allAmbitions = await Ambition.find({
    user: userId,
  }).select('title type description isCompleted createdAt').lean()

  // Calculate counts
  const totalCount = allAmbitions.length
  const completedCount = allAmbitions.filter(
    (a) => a.isCompleted === true,
  ).length
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  // Separate by type
  const ambitions = {
    deen: allAmbitions.filter((a) => a.type === AmbitionsType.deen), // based on type
    dunya: allAmbitions.filter((a) => a.type === AmbitionsType.dunya), // based on type
  }

  return {
    totalCount,
    completedCount,
    progress,
    ambitions,
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
