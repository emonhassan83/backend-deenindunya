import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TDuas } from './duas.interface'
import { Duas } from './duas.model'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

const insertIntoDB = async (payload: TDuas): Promise<TDuas> => {
  // Check if dua with same arabic text already exists in this category
  const existing = await Duas.findOne({
    category: payload.category,
    arabic_text: payload.arabic_text.trim(),
    isDeleted: false,
  }).lean()

  if (existing) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Dua with same Arabic text already exists in this category',
    )
  }

  // Ensure recited_count has a default
  payload.recited_count = payload.recited_count || 1

  // Create new dua
  const result = await Duas.create(payload)

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.DUA_PATTERN)

  return result
}

// Admin only: Get all duas with pagination, search, category filter (excludes -updatedAt and -isDeleted)
const getAllFromDB = async (query: Record<string, unknown>) => {
  const cacheKey = REDIS_KEYS.DUA_ALL(JSON.stringify(query))
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const { category, search, page = 1, limit = 10 } = query

  const filter: Record<string, unknown> = { isDeleted: false }

  // Filter by category
  if (category) {
    filter.category = category
  }

  // Search functionality
  if (search) {
    filter.$text = { $search: search as string }
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [result, total] = await Promise.all([
    Duas.find(filter)
      .select(
        '_id category banner arabic_text transliteration english_meaning reference audio_url benefit recited_count createdAt',
      )
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean(),
    Duas.countDocuments(filter),
  ])

  const finalResult = {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  }

  await setCache(cacheKey, finalResult)

  return finalResult
}

// User view: Returns { todaysDua, duaLists } with category filter, search & pagination
const getUserViewDuas = async (query: Record<string, unknown>) => {
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = REDIS_KEYS.DUA_USER_VIEW(today, JSON.stringify(query))
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const { category, search, page = 1, limit = 10 } = query

  const filter: Record<string, unknown> = { isDeleted: false }

  if (category) {
    filter.category = category
  }

  if (search) {
    filter.$text = { $search: search as string }
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [duaLists, total] = await Promise.all([
    Duas.find(filter)
      .select(
        '_id category banner arabic_text transliteration english_meaning reference audio_url benefit recited_count',
      )
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean(),
    Duas.countDocuments(filter),
  ])

  // Determine todaysDua (deterministic rotation - same dua for all users on the same calendar day)
  const todayFilter: Record<string, unknown> = { isDeleted: false }
  if (category) {
    todayFilter.category = category
  }

  const candidateDuas = await Duas.find(todayFilter)
    .select(
      '_id category banner arabic_text transliteration english_meaning reference audio_url benefit recited_count',
    )
    .lean()

  let todaysDua: any = null
  if (candidateDuas.length > 0) {
    const now = new Date()
    const dayNumber = Math.floor(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) /
        (1000 * 60 * 60 * 24),
    )
    const selectedIndex = dayNumber % candidateDuas.length
    todaysDua = candidateDuas[selectedIndex]
  }

  const finalResult = {
    data: {
      todaysDua,
      duaLists,
    },
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  }

  await setCache(cacheKey, finalResult, 86400) // 24 hours TTL

  return finalResult
}

const getSingleFromDB = async (id: string): Promise<TDuas> => {
  const cacheKey = REDIS_KEYS.DUA_SINGLE(id)
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const result = await Duas.findById(id)
    .select(
      '_id category banner arabic_text transliteration english_meaning reference audio_url benefit recited_count createdAt',
    )
    .lean()

  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Dua not found!')
  }

  await setCache(cacheKey, result)

  return result
}

const updateIntoDB = async (
  id: string,
  payload: Partial<TDuas>,
): Promise<TDuas> => {
  // Check if dua exists
  const existing = await Duas.findById(id)
  if (!existing || existing.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Dua not found!')
  }

  // If arabic_text is being updated, check for duplicates
  if (payload.arabic_text) {
    const duplicate = await Duas.findOne({
      category: payload.category || existing.category,
      arabic_text: payload.arabic_text.trim(),
      _id: { $ne: id },
      isDeleted: false,
    })

    if (duplicate) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Another dua with the same Arabic text already exists in this category',
      )
    }
  }

  const updated = await Duas.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  }).lean()

  if (!updated) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update dua')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.DUA_PATTERN)

  return updated
}

const deleteFromDB = async (id: string): Promise<TDuas> => {
  const result = await Duas.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { returnDocument: 'after' },
  ).lean()

  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Dua deletion failed!')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.DUA_PATTERN)

  return result
}

export const DuasService = {
  insertIntoDB,
  getAllFromDB,
  getUserViewDuas,
  getSingleFromDB,
  updateIntoDB,
  deleteFromDB,
}
