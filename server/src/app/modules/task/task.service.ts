import httpStatus from 'http-status'
import { TTask } from './task.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Task } from './task.models'
import moment from 'moment-timezone'
import { TASK_TYPE } from './task.constants'

// Create a new Project
const insertIntoDB = async (userId: string, payload: TTask) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // Validate timezone
  const validTimezones = moment.tz.names()
  if (!validTimezones.includes(user.timezone)) {
    throw new Error('Invalid timezone')
  }

  // Validate logAt format
  if (!moment(payload.logAt, 'YYYY-MM-DD', true).isValid()) {
    throw new Error('logAt must be in YYYY-MM-DD format')
  }

  // Assign the user and user time zone to the task
  payload.user = user._id

  const result = await Task.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task creation failed')
  }

  return result
}

// task.service.ts
const getAllIntoDB = async (query: Record<string, any>, userId: string) => {
  const { type } = query

  // Validate type is provided
  if (!type) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Task type is required (daily, weekly, or monthly)',
    )
  }

  // Validate type is valid
  if (!Object.values(TASK_TYPE).includes(type)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid task type. Must be ${TASK_TYPE.daily}, ${TASK_TYPE.weekly}, or ${TASK_TYPE.monthly}`,
    )
  }

  // Validate user exists
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  // Get all tasks of the specified type
  const tasks = await Task.find({
    user: userId,
    type: type,
  }).select('type title logAt isCompleted')
    .sort({ logAt: -1, createdAt: -1 })
    .lean()

  return tasks
}

// Toggle task status
const changedStatusIntoDB = async (id: string) => {
  const task = await Task.findById(id)

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found!')
  }

  const updatedStatus = !task.isCompleted

  const result = await Task.findByIdAndUpdate(
    id,
    { isCompleted: updatedStatus },
    { new: true },
  )
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Task record not updated!',
    )
  }

  return result
}

// Delete Task
const deleteAIntoDB = async (id: string) => {
  const task = await Task.findById(id)
  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found!')
  }

  const result = await Task.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task deletion failed')
  }

  return result
}

export const TaskService = {
  insertIntoDB,
  getAllIntoDB,
  changedStatusIntoDB,
  deleteAIntoDB,
}
