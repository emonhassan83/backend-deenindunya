import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { Contents } from './contents.models'
import { GENERAL_KEYS } from './contents.constants'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

// Get single content
const getContent = async (key: string) => {
  if (!key) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Key is required')
  }

  const cacheKey = REDIS_KEYS.CONTENT_BY_KEY(key)
  const cached = await getCache<any>(cacheKey)
  if (cached) {
    return cached
  }

  const content = await Contents.findOne({ key }).select('-__v').lean()
  if (!content) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Content with key "${key}" not found`,
    )
  }

  await setCache(cacheKey, content)
  return content
}

// Get general contents
const getContentGenerals = async () => {
  const cacheKey = REDIS_KEYS.CONTENT_GENERALS
  const cached = await getCache<any[]>(cacheKey)
  if (cached) {
    return cached
  }

  const contents = await Contents.find({ key: { $in: GENERAL_KEYS } })
    .select('-__v')
    .lean()

  await setCache(cacheKey, contents)
  return contents
}

// Create or Update Content
const createOrUpdate = async (key: string, payload: any) => {
  if (!key || key === 'generals') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Key is required and cannot be "generals"',
    )
  }

  const content = await Contents.findOneAndUpdate(
    { key },
    { key, value: payload.value ?? payload },
    { returnDocument: 'after', upsert: true }
  ).select('-__v')

  // Invalidate related cache entries
  await deleteCachePattern(REDIS_KEYS.CONTENT_PATTERN)

  return content
}

// Update multiple general contents
const updateGenerals = async (payload: Record<string, any>) => {
  const validKeys = GENERAL_KEYS.filter((key) => payload[key] !== undefined)

  if (validKeys.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No valid general content keys provided',
    )
  }

  // Update all matching keys in parallel
  await Promise.all(
    validKeys.map((key) =>
      Contents.findOneAndUpdate(
        { key },
        { value: payload[key] },
        { upsert: true, returnDocument: 'after' }
      ).select('-__v')
    )
  )

  // Invalidate cache for contents
  await deleteCachePattern(REDIS_KEYS.CONTENT_PATTERN)
}

export const contentsService = {
  getContent,
  getContentGenerals,
  createOrUpdate,
  updateGenerals,
}
