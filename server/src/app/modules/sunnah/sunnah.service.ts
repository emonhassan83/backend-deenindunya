import httpStatus from 'http-status'
import { Types } from 'mongoose'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import QueryBuilder from '../../builder/QueryBuilder'
import { Sunnah, SunnaMemorizedLog } from './sunnah.models'
import { TSunnah } from './sunnah.interface'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

// Create a new sunnah
const insertIntoDB = async (payload: TSunnah) => {
  const exist = await Sunnah.findOne({
    title: payload.title,
    subtitle: payload.subtitle,
    isDeleted: false,
  })
  if (exist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Sunnah already exists')
  }

  // Sync howToPractise and explanation if one is provided
  if (payload.howToPractise && !payload.explanation) {
    payload.explanation = payload.howToPractise
  } else if (payload.explanation && !payload.howToPractise) {
    payload.howToPractise = payload.explanation
  }

  const result = await Sunnah.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Sunnah creation failed')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.SUNNAH_GLOBAL_PATTERN)

  return result
}

// Get all sunnahs for Admin view with pagination, search, filter, sort (excluding updatedAt and without isMemorized)
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

  const data = await qb.modelQuery.select('-updatedAt').lean()
  const meta = await qb.countTotal()

  const result = { data, meta }
  await setCache(cacheKey, result)

  return result
}

// Get User View Sunnahs (todaysSunnah + sunnahList with category filtering & pagination)
const getUserViewSunnahs = async (
  query: Record<string, any>,
  userId?: string,
) => {
  const today = new Date().toISOString().slice(0, 10)
  const userIdentifier = userId || 'public'
  const cacheKey = REDIS_KEYS.SUNNAH_USER_VIEW(
    userIdentifier,
    today,
    JSON.stringify(query),
  )

  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // 1. Query for sunnahList
  const qb = new QueryBuilder(Sunnah.find({ isDeleted: false }), query)
    .search(['title'])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await qb.modelQuery
  const meta = await qb.countTotal()

  // 2. Fetch memorized Sunnah IDs for the user
  let memorizedSunnahIds = new Set<string>()
  if (userId) {
    const logs = await SunnaMemorizedLog.find({ user: userId })
      .select('sunnah')
      .lean()
    memorizedSunnahIds = new Set(logs.map((log) => log.sunnah.toString()))
  }

  // Map sunnahList to include isMemorized
  const sunnahList = data.map((item: any) => {
    const sunnahObj = item.toObject ? item.toObject() : item
    return {
      ...sunnahObj,
      isMemorized: userId
        ? memorizedSunnahIds.has(sunnahObj._id.toString())
        : false,
    }
  })

  // 3. Determine todaysSunnah (Daily rotating focus)
  // If category filter is passed, pick from that category. If not, pick from all non-deleted sunnahs.
  const todayFilter: Record<string, any> = { isDeleted: false }
  if (query.category) {
    todayFilter.category = query.category
  }

  const candidateSunnahs = await Sunnah.find(todayFilter).lean()

  let todaysSunnah: any = null
  if (candidateSunnahs.length > 0) {
    const now = new Date()
    const dayNumber = Math.floor(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) /
        (1000 * 60 * 60 * 24),
    )
    const selectedIndex = dayNumber % candidateSunnahs.length
    const candidate = candidateSunnahs[selectedIndex]

    todaysSunnah = {
      ...candidate,
      isMemorized: userId
        ? memorizedSunnahIds.has(candidate._id.toString())
        : false,
    }
  }

  const result = {
    data: {
      todaysSunnah,
      sunnahList,
    },
    meta,
  }

  await setCache(cacheKey, result)

  return result
}

// Get single Sunnah by ID
const getASunnah = async (id: string, userId?: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Sunnah ID')
  }

  const userIdentifier = userId || 'public'
  const cacheKey = REDIS_KEYS.SUNNAH_SINGLE(id, userIdentifier)
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const sunnah = await Sunnah.findOne({ _id: id, isDeleted: false }).lean()
  if (!sunnah) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  }

  let isMemorized = false
  if (userId) {
    const log = await SunnaMemorizedLog.exists({ user: userId, sunnah: id })
    isMemorized = !!log
  }

  const result = {
    ...sunnah,
    isMemorized,
  }

  await setCache(cacheKey, result)

  return result
}

const updateIntoDB = async (id: string, payload: Partial<TSunnah>) => {
  const exist = await Sunnah.findById(id)
  if (!exist || exist.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  }

  if (payload.howToPractise && !payload.explanation) {
    payload.explanation = payload.howToPractise
  } else if (payload.explanation && !payload.howToPractise) {
    payload.howToPractise = payload.explanation
  }

  const result = await Sunnah.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
  })
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

// Toggle Sunnah as memorized for a user
const toggleAsMemorized = async (userId: string, sunnahId: string) => {
  if (!Types.ObjectId.isValid(sunnahId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sunnah ID')
  }

  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const sunnah = await Sunnah.findById(sunnahId)
  if (!sunnah || sunnah.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sunnah not found')
  }

  // Check if memorized log already exists
  const logExist = await SunnaMemorizedLog.findOne({
    user: userId,
    sunnah: sunnahId,
  })

  let isMemorized = false
  if (logExist) {
    await SunnaMemorizedLog.findByIdAndDelete(logExist._id)
    isMemorized = false
  } else {
    await SunnaMemorizedLog.create({
      user: userId,
      sunnah: sunnahId,
    })
    isMemorized = true
  }

  // Invalidate cache for sunnahs
  await deleteCachePattern(REDIS_KEYS.SUNNAH_GLOBAL_PATTERN)

  return {
    isMemorized,
    message: isMemorized
      ? 'Sunnah marked as memorized successfully'
      : 'Sunnah unmarked from memorized successfully',
  }
}

export const SunnahService = {
  insertIntoDB,
  getAllIntoDB,
  getUserViewSunnahs,
  getASunnah,
  updateIntoDB,
  deleteAIntoDB,
  toggleAsMemorized,
}
