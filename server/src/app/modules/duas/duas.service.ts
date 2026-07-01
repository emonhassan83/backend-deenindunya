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
      'Dua with same Arabic text already exists in this category'
    )
  }

  // Create new dua
  const result = await Duas.create(payload)

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.DUA_PATTERN)

  return result
}

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

  const result = await Duas.find(filter)
    .populate('category', 'title')
    .select('-isDeleted')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean()

  const total = await Duas.countDocuments(filter)

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

const getSingleFromDB = async (id: string): Promise<TDuas> => {
  const cacheKey = REDIS_KEYS.DUA_SINGLE(id)
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const result = await Duas.findById(id)
    .populate('category', 'title')
    .select('-isDeleted')
    .lean()

  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Dua not found!')
  }

  await setCache(cacheKey, result)

  return result
}

const updateIntoDB = async (
  id: string,
  payload: Partial<TDuas>
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
        'Another dua with the same Arabic text already exists in this category'
      )
    }
  }

  const updated = await Duas.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate('category', 'title')
    .lean()

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
    { new: true }
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
  getSingleFromDB,
  updateIntoDB,
  deleteFromDB,
}