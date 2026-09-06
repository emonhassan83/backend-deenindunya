import httpStatus from 'http-status'
import { Types } from 'mongoose'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import QueryBuilder from '../../builder/QueryBuilder'
import { Sunnah, SunnahLog } from './sunnah.models'
import { TSunnah } from './sunnah.interface'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'
import { isValidDate } from '../../utils/isValidDate'

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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.SUNNAH_GLOBAL_PATTERN)

  return result
}

// Get all sunnahs with pagination, search, filter, sort and field selection
const getAllIntoDB = async (query: Record<string, any>) => {
  const cacheKey = REDIS_KEYS.SUNNAH_ADMIN(JSON.stringify(query))
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const qb = new QueryBuilder(Sunnah.find({ isDeleted: false }), query)
    .search(['title'])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await qb.modelQuery
  const meta = await qb.countTotal()

  const result = { data, meta }
  await setCache(cacheKey, result)

  return result
}

const updateIntoDB = async (id: string, payload: Partial<TSunnah>) => {
  const exist = await Sunnah.findById(id)
  if (!exist || exist.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  }

  const result = await Sunnah.findByIdAndUpdate(id, payload, { returnDocument: 'after' })
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.SUNNAH_GLOBAL_PATTERN)

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
    { returnDocument: 'after' },
  )
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.SUNNAH_GLOBAL_PATTERN)

  return result
}

// User: Toggle SunnahLog
const toggleSunnahLog = async (
  userId: string,
  sunnahId: string,
  completedAt: string,
) => {
  if (!Types.ObjectId.isValid(sunnahId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sunnah ID')
  }

  if (!completedAt || typeof completedAt !== 'string') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'completedAt is required. Please provide date in YYYY-MM-DD format',
    )
  }

  if (!isValidDate(completedAt)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid completedAt format. Please use YYYY-MM-DD format',
    )
  }

  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const sunnah = await Sunnah.findById(sunnahId)
  if (!sunnah || sunnah.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  }

  // Toggle log
  const logExist = await SunnahLog.findOne({
    user: userId,
    sunnah: sunnahId,
    completedAt,
  })

  let logResult
  if (logExist) {
    await SunnahLog.findByIdAndDelete(logExist._id)
    logResult = { message: 'Logged out successfully' }
  } else {
    const log = await SunnahLog.create({
      user: userId,
      sunnah: sunnahId,
      completedAt,
    })
    logResult = log
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.SUNNAH_USER_PATTERN(userId))

  return logResult
}

const getUserSunnahs = async (userId: string, query: Record<string, any>) => {
  const cacheKey = REDIS_KEYS.SUNNAH_USER(userId, JSON.stringify(query))
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

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

  const result = {
    data: {
      totalCompleted: logs.length,
      todayMemorized,
      rawMemorized,
      data: enriched,
    },
    meta,
  }

  await setCache(cacheKey, result)

  return result
}

export const SunnahService = {
  insertIntoDB,
  getAllIntoDB,
  updateIntoDB,
  deleteAIntoDB,
  toggleSunnahLog,
  getUserSunnahs,
}
