import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TAffirmation } from './affirmations.interface'
import { Affirmation } from './affirmations.model'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

const insertIntoDB = async (payload: TAffirmation): Promise<TAffirmation> => {
  // Check if affirmation with same arabic text already exists
  const existing = await Affirmation.findOne({
    arabic_text: payload.arabic_text.trim(),
    isDeleted: false,
  }).lean()

  if (existing) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Affirmation with same Arabic text already exists'
    )
  }

  // Create new affirmation
  const result = await Affirmation.create(payload)

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.AFFIRMATION_PATTERN)

  return result
}

const getAllFromDB = async (query: Record<string, unknown>) => {
  const cacheKey = REDIS_KEYS.AFFIRMATION_ALL(JSON.stringify(query))
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const { search, page = 1, limit = 10 } = query

  const filter: Record<string, unknown> = { isDeleted: false }

  // Search functionality
  if (search) {
    filter.$text = { $search: search as string }
  }

  const skip = (Number(page) - 1) * Number(limit)

  const result = await Affirmation.find(filter)
    .select('arabic_text transliteration english_meaning reference audio_url createdAt')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean()

  const total = await Affirmation.countDocuments(filter)

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

const getSingleFromDB = async (id: string): Promise<TAffirmation> => {
  const cacheKey = REDIS_KEYS.AFFIRMATION_SINGLE(id)
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const result = await Affirmation.findById(id)
    .select('arabic_text transliteration english_meaning reference audio_url createdAt')
    .lean()

  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Affirmation not found!')
  }

  await setCache(cacheKey, result)

  return result
}

const getARandomAffermation = async (): Promise<TAffirmation> => {
  const [result] = await Affirmation.aggregate([
    { $match: { isDeleted: false } },
    { $sample: { size: 1 } },
    {
      $project: {
        arabic_text: 1,
        transliteration: 1,
        english_meaning: 1,
        reference: 1,
        audio_url: 1,
        createdAt: 1,
      },
    },
  ])

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Affirmation not found!')
  }

  return result
}

const updateIntoDB = async (
  id: string,
  payload: Partial<TAffirmation>
): Promise<TAffirmation> => {
  // Check if affirmation exists
  const existing = await Affirmation.findById(id)
  if (!existing || existing.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Affirmation not found!')
  }

  // If arabic_text is being updated, check for duplicates
  if (payload.arabic_text) {
    const duplicate = await Affirmation.findOne({
      arabic_text: payload.arabic_text.trim(),
      _id: { $ne: id },
      isDeleted: false,
    })

    if (duplicate) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Another affirmation with the same Arabic text already exists'
      )
    }
  }

  const updated = await Affirmation.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  }).lean()

  if (!updated) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update affirmation')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.AFFIRMATION_PATTERN)

  return updated
}

const deleteFromDB = async (id: string): Promise<TAffirmation> => {
  const result = await Affirmation.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { returnDocument: 'after' }
  ).lean()

  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Affirmation deletion failed!')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.AFFIRMATION_PATTERN)

  return result
}

export const AffirmationService = {
  insertIntoDB,
  getAllFromDB,
  getSingleFromDB,
  getARandomAffermation,
  updateIntoDB,
  deleteFromDB,
}
