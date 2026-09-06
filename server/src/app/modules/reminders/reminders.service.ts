import httpStatus from 'http-status'
import { TReminder } from './reminders.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Reminder } from './reminders.models'
import { isValidDate } from '../../utils/isValidDate'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.REMINDER_PATTERN(userId))

  return result
}

// Get all reminder data
const getAllIntoDB = async (userId: string, query: Record<string, any>) => {
  const { date } = query

  // Validate date is provided
  if (!date) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      'Date is required. Please provide date in YYYY-MM-DD format'
    );
  }

  // Validate date format
  if (!isValidDate(date)) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      'Invalid date format. Please use YYYY-MM-DD format (e.g., 2026-04-22)'
    );
  }

  const cacheKey = REDIS_KEYS.REMINDER_KEY(userId, date)
  const cachedData = await getCache<any[]>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // date format: YYYY-MM-DD
  const data = await Reminder.find({
    user: userId,
    logAt: date,
  })
    .sort({ createdAt: -1 })
    .select('title logAt isCompleted')
    .lean()

  await setCache(cacheKey, data)

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
    { returnDocument: 'after' },
  )

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Reminder status not updated!',
    )
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.REMINDER_PATTERN(String(reminder.user)))

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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.REMINDER_PATTERN(String(reminder.user)))

  return result
}

export const ReminderService = {
  insertIntoDB,
  getAllIntoDB,
  toggleCompleteIntoDB,
  deleteAIntoDB,
}
