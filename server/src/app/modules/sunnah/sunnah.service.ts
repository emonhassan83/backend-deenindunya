import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import QueryBuilder from '../../builder/QueryBuilder'
import { Sunnah, SunnahLog } from './sunnah.models'
import { TSunnah } from './sunnah.interface'

// Create a new sunnah
const insertIntoDB = async (payload: TSunnah) => {
  const exist = await Sunnah.findOne({
    title: payload.title,
    subtitle: payload.subtitle,
  })
  if (exist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Sunnah already exists')
  }

  const result = await Sunnah.create(payload)
  if (!result)
    throw new AppError(httpStatus.BAD_REQUEST, 'Sunnah creation failed')

  return result
}

// Get all sunnahs with pagination, search, filter, sort and field selection
const getAllIntoDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Sunnah.find({ isDeleted: false }), query)
    .search(['title'])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await qb.modelQuery
  const meta = await qb.countTotal()

  return { data, meta }
}

const updateIntoDB = async (id: string, payload: Partial<TSunnah>) => {
  const exist = await Sunnah.findById(id)
  if (!exist || exist.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  }

  const result = await Sunnah.findByIdAndUpdate(id, payload, { new: true })
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  return result
}

// Delete Sunnah
const deleteAIntoDB = async (id: string) => {
  const exist = await Sunnah.findById(id)
  if (!exist || exist.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  }

  const result = await Sunnah.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  )
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  return result
}

// User: Toggle SunnahLog
const toggleSunnahLog = async (
  userId: string,
  sunnahId: string,
  payload: { completedAt: string },
) => {
  const { completedAt } = payload

  const user = await User.findById(userId)
  if (!user || user.isDeleted)
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  const sunnah = await Sunnah.findById(sunnahId)
  if (!sunnah || sunnah.isDeleted)
    throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')

  const existing = await SunnahLog.findOne({ user: userId, sunnah: sunnahId })
  if (existing) {
    return await SunnahLog.findByIdAndDelete(existing._id)
  } else {
    const log = await SunnahLog.create({
      user: userId,
      sunnah: sunnahId,
      completedAt,
    })
    return log
  }
}

const getUserSunnahs = async (userId: string, query: Record<string, any>) => {
  // Build query for Sunnah documents
  const qb = new QueryBuilder(
    // @ts-ignore
    Sunnah.find({ isDeleted: false }).select('title subtitle arabicText'),
    query,
  )
    .search(['title'])
    .filter()
    .paginate()
    .sort()
    .fields()

  // Fetch sunnahs, metadata, and user's logs in parallel
  const [sunnahs, meta, logs] = await Promise.all([
    qb.modelQuery,
    qb.countTotal(),
    SunnahLog.find({ user: userId }).lean(),
  ])

  // Map logs by sunnah ID for quick lookup
  const logMap = new Map(logs.map((l) => [l.sunnah.toString(), l]))
  const enriched = sunnahs.map((s) => {
    const log = logMap.get(s._id.toString())
    return {
      ...s.toObject(),
      isMemorized: !!log,
      memorizedAt: log?.completedAt || null,
    }
  })

  // --- Calculate today's memorized count and raw streak ---
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD' UTC

  // Count how many logs were completed today
  const todayMemorized = logs.filter((log) => log.completedAt === today).length

  // Get unique dates from logs and sort them descending (latest first)
  const uniqueDates = [...new Set(logs.map((log) => log.completedAt))].sort()
  const reversedDates = [...uniqueDates].reverse()

  // Calculate consecutive days streak (rawMemorized)
  let streak = 0
  let expectedDate = today

  for (const date of reversedDates) {
    if (date === expectedDate) {
      streak++
      // Move to the previous day
      const prevDate = new Date(date)
      prevDate.setDate(prevDate.getDate() - 1)
      expectedDate = prevDate.toISOString().slice(0, 10)
    } else {
      break
    }
  }

  const rawMemorized = streak

  // Return enriched data with extra fields
  return {
    data: {
      totalCompleted: logs.length,
      todayMemorized,
      rawMemorized,
      data: enriched,
    },
    meta,
  }
}

export const SunnahService = {
  insertIntoDB,
  getAllIntoDB,
  updateIntoDB,
  deleteAIntoDB,
  toggleSunnahLog,
  getUserSunnahs,
}
