import httpStatus from 'http-status'
import { TReminder } from './reminders.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Reminder } from './reminders.models'
import { isValidDate } from '../../utils/isValidDate'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'
import { PERMANENT_REMINDERS } from './reminders.constants'

// Ensure permanent Dhikr reminders exist for a user on a given date
const ensurePermanentReminders = async (userId: string, date: string) => {
  // Find all records for that date (even if deleted) so user-deleted ones don't reappear on the same day
  const existingReminders = await Reminder.find({
    user: userId,
    logAt: date,
  })
    .select('title')
    .lean()

  const existingTitles = new Set(existingReminders.map((r) => r.title))

  const missingReminders = PERMANENT_REMINDERS.filter(
    (title) => !existingTitles.has(title),
  ).map((title) => ({
    user: userId,
    title,
    logAt: date,
    isCompleted: false,
    isPermanent: true,
    isDeleted: false,
  }))

  if (missingReminders.length > 0) {
    try {
      await Reminder.insertMany(missingReminders, { ordered: false })
    } catch (error) {
      // Silently ignore any duplicate key or race-condition error
    }
  }
}

// Create a new custom Reminder
const insertIntoDB = async (userId: string, payload: TReminder) => {
  // Validate user existence
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // Add user to payload and mark as custom (not permanent)
  payload.user = userId as any
  payload.isPermanent = false
  payload.isDeleted = false

  const result = await Reminder.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reminder creation failed')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.REMINDER_PATTERN(userId))

  return result
}

// Get all active reminder data (including permanent and custom reminders for that date)
const getAllIntoDB = async (userId: string, query: Record<string, any>) => {
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

  const cacheKey = REDIS_KEYS.REMINDER_KEY(userId, date)
  const cachedData = await getCache<any[]>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Ensure permanent reminders exist for this user on this date
  await ensurePermanentReminders(userId, date)

  // date format: YYYY-MM-DD, only active (not deleted) reminders
  const data = await Reminder.find({
    user: userId,
    logAt: date,
    isDeleted: false,
  })
    .sort({ isPermanent: -1, createdAt: 1 })
    .select('title logAt isCompleted isPermanent')
    .lean()

  await setCache(cacheKey, data)

  return data
}

// Toggle Reminder completion status
const toggleCompleteIntoDB = async (id: string) => {
  const reminder = await Reminder.findOne({ _id: id, isDeleted: false })
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

// Delete Reminder (supports removing both permanent and custom reminders for the day)
const deleteAIntoDB = async (id: string) => {
  const reminder = await Reminder.findOne({ _id: id, isDeleted: false })
  if (!reminder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reminder not found!')
  }

  // Soft delete so permanent reminders don't pop back up on the same day after removal
  const result = await Reminder.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { returnDocument: 'after' },
  )

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reminder deletion failed')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.REMINDER_PATTERN(String(reminder.user)))

  return result
}

export const ReminderService = {
  ensurePermanentReminders,
  insertIntoDB,
  getAllIntoDB,
  toggleCompleteIntoDB,
  deleteAIntoDB,
}
