import httpStatus from 'http-status'
import { TReminder } from './reminders.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Reminder } from './reminders.models'

// Create a new Reminder
const insertIntoDB = async (userId: string, payload: TReminder) => {
  // validate user existence
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // Add user to payload
  payload.user = userId as any

  const result = await Reminder.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reminder creation failed')
  }

  return result
}

// Get all reminder data
const getAllIntoDB = async (userId: string, query: Record<string, any>) => {
  const { date } = query

  // date format: YYYY-MM-DD
  const data = await Reminder.find({
    user: userId,
    logAt: date,
  })
    .sort({ createdAt: -1 })
    .select('title logAt isCompleted')
    .lean()

  return data
}

// Toggle Reminder completion status
const toggleCompleteIntoDB = async (id: string) => {
  const reminder = await Reminder.findById(id)
  if (!reminder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reminder not found!')
  }

  const updatedStatus = !reminder.isCompleted

  const result = await Reminder.findByIdAndUpdate(
    id,
    { isCompleted: updatedStatus },
    { new: true },
  )

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Reminder status not updated!',
    )
  }

  return result
}

// Delete Reminder
const deleteAIntoDB = async (id: string) => {
  const reminder = await Reminder.findById(id)
  if (!reminder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reminder not found!')
  }

  const result = await Reminder.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reminder deletion failed')
  }

  return result
}

export const ReminderService = {
  insertIntoDB,
  getAllIntoDB,
  toggleCompleteIntoDB,
  deleteAIntoDB,
}
