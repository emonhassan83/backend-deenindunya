import httpStatus from 'http-status'
import { TTask } from './task.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Task } from './task.models'
import QueryBuilder from '../../builder/QueryBuilder'
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
  payload.userTimeZone = user.timezone

  const result = await Task.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task creation failed')
  }

  return result
}

// Get all assign project data
// task.service.ts
const getAllIntoDB = async (query: Record<string, any>) => {
  const { userId, userTimeZone = 'Asia/Dhaka' } = query
  
  if (!userId) {
    throw new Error("User ID is required")
  }
  
  // First, get all tasks for the user (including "expired" ones)
  const allTasks = await Task.find({ 
    user: userId,
    isCompleted: false  // Only incomplete tasks
  }).sort({ createdAt: -1 })
  
  // Filter tasks based on type and date (in-memory filtering)
  // This ensures users see tasks correctly even if cron fails
  const filteredTasks = allTasks.filter(task => {
    const taskDate = moment.tz(task.logAt, 'YYYY-MM-DD', userTimeZone)
    const now = moment.tz(userTimeZone)
    
    switch (task.type) {
      case TASK_TYPE.daily:
        // Task is valid only on its logAt date
        return taskDate.isSame(now, 'day')
        
      case TASK_TYPE.weekly:
        // Task is valid for 7 days starting from logAt
        const weekEnd = taskDate.clone().add(7, 'days')
        return now.isBetween(taskDate, weekEnd, 'day', '[]')
        
      case TASK_TYPE.monthly:
        // Task is valid for 30 days starting from logAt
        const monthEnd = taskDate.clone().add(30, 'days')
        return now.isBetween(taskDate, monthEnd, 'day', '[]')
        
      default:
        return true
    }
  })
  
  return filteredTasks
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
