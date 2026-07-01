import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import QueryBuilder from '../../builder/QueryBuilder'
import { Event } from './event.models'
import { TEvent } from './event.interface'
import { EVENT_TYPE } from './event.constants'
import { getMonthName, groupEventsByMonth } from './event.utils'

// event.service.ts
const insertIntoDB = async (payload: TEvent, userId: string) => {
  const { type, title, date } = payload

  // 1. Validate user exists
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // 2. Check for duplicate event (same title + date for same type)
  const exist = await Event.findOne({
    type: type,
    title: title,
    date: date,
  })
  
  if (exist) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      `Event "${title}" on ${date} already exists`
    )
  }

  // 3. Prepare payload based on event type
  let finalPayload: any = {
    type: type,
    title: title,
    description: payload.description || '',
    date: date,
  }

  // ✅ If type is 'user', save the user ID
  // ✅ If type is 'islamic', user remains null (default)
  if (type === EVENT_TYPE.user) {
    finalPayload.user = userId
  } else {
    finalPayload.user = null
  }

  // 4. Create event
  const result = await Event.create(finalPayload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Event creation failed')
  }

  return result
}

// Get all events Events data
const getAllIntoDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Event.find({ isDeleted: false }), query)
    .search(['title'])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await qb.modelQuery
  const meta = await qb.countTotal()

  return { data, meta }
}

// Get all events (Islamic + User) for a specific user
const getAllEventsForUser = async (
  userId: string,
  query: Record<string, any>,
) => {
  const { startDate, endDate, month, year } = query

  let dateFilter: any = {}

  // Date range filter
  if (startDate && endDate) {
    dateFilter.date = { $gte: startDate, $lte: endDate }
  }

  // Month filter
  if (month && year) {
    const paddedMonth = String(month).padStart(2, '0')
    dateFilter.date = { $regex: `^${year}-${paddedMonth}` }
  }

  // Get Islamic events (global)
  const islamicEvents = await Event.find({
    type: EVENT_TYPE.islamic,
    ...dateFilter,
  }).sort({ date: 1 })

  // Get user's personal events
  const userEvents = await Event.find({
    type: EVENT_TYPE.user,
    user: userId,
    ...dateFilter,
  }).sort({ date: 1 })

  // Combine and sort by date
  const allEvents = [...islamicEvents, ...userEvents].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Group by month for better UI
  const eventsByMonth = groupEventsByMonth(allEvents)

  return {
    total: allEvents.length,
    islamicCount: islamicEvents.length,
    userCount: userEvents.length,
    events: allEvents,
    eventsByMonth,
  }
}

// Get events for a specific date
const getEventsByDate = async (userId: string, query: Record<string, any>) => {
  const { date } = query

  const events = await Event.find({
    $or: [
      { type: EVENT_TYPE.islamic, date },
      { type: EVENT_TYPE.user, user: userId, date },
    ],
  }).sort({ type: 1 })

  return events
}

// Get all events (Islamic + User) for a specific month with calendar view
const getAllEventsByMonth = async (
  userId: string,
  query: Record<string, any>,
) => {
  const { yearMonth } = query

  // Validate format YYYY-MM
  if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid format. Please use YYYY-MM format (e.g., 2026-04)',
    )
  }

  // Parse year and month from "2026-04" format
  const [year, month] = yearMonth.split('-')
  const paddedMonth = month.padStart(2, '0')

  // Get total days in that month
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()

  // Create array of all dates in the month
  const allDates = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${paddedMonth}-${String(day).padStart(2, '0')}`
    allDates.push(dateStr)
  }

  // Fetch Islamic events for this month (global)
  const islamicEvents = await Event.find({
    type: EVENT_TYPE.islamic,
    date: {
      $regex: `^${year}-${paddedMonth}`,
    },
  })
    .sort({ date: 1 })
    .lean()

  // Fetch User events for this month (user specific)
  const userEvents = await Event.find({
    type: EVENT_TYPE.user,
    user: userId,
    date: {
      $regex: `^${year}-${paddedMonth}`,
    },
  })
    .sort({ date: 1 })
    .lean()

  // Combine all events
  const allEvents = [...islamicEvents, ...userEvents]

  // Create a Map of dates with events (for faster lookup)
  const eventsByDate = new Map()
  for (const event of allEvents) {
    if (!eventsByDate.has(event.date)) {
      eventsByDate.set(event.date, [])
    }
    eventsByDate.get(event.date).push(event)
  }

  // Build calendar array with hasEvent flag
  const calendar = allDates.map((date) => ({
    date: date,
    hasEvent: eventsByDate.has(date),
  }))

  return {
    year: parseInt(year),
    month: parseInt(month),
    calendar,
  }
}

// Get current year all Islamic events (Direct data, no grouping)
const getCurrentYearIslamicEvents = async (query: Record<string, any>) => {
  const { year } = query

  if (!year) {
    throw new Error('Year is required')
  }

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  // Direct find - no grouping
  const events = await Event.find({
    type: EVENT_TYPE.islamic,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: 1 })
    .lean()

  return {
    year: parseInt(year),
    totalEvents: events.length,
    events: events,
  }
}

const updateIntoDB = async (id: string, payload: Partial<TEvent>) => {
  const exist = await Event.findById(id)
  if (!exist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
  }

  const result = await Event.findByIdAndUpdate(id, payload, { new: true })
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
  return result
}

const deleteAIntoDB = async (id: string) => {
  const exist = await Event.findById(id)
  if (!exist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
  }

  const result = await Event.findByIdAndDelete(id)
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
  return result
}

export const EventService = {
  insertIntoDB,
  getAllIntoDB,
  getAllEventsForUser,
  getEventsByDate,
  getAllEventsByMonth,
  getCurrentYearIslamicEvents,
  updateIntoDB,
  deleteAIntoDB,
}
