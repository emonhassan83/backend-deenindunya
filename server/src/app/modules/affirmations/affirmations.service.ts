import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TAffirmation } from './affirmations.interface'
import { Affirmation } from './affirmations.model'

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
  return result
}

const getAllFromDB = async (query: Record<string, unknown>) => {
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

  return {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  }
}

const getSingleFromDB = async (id: string): Promise<TAffirmation> => {
  const result = await Affirmation.findById(id)
    .select('arabic_text transliteration english_meaning reference audio_url createdAt')
    .lean()

  if (!result || result.isDeleted) {
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
    new: true,
    runValidators: true,
  }).lean()

  if (!updated) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update affirmation')
  }

  return updated
}

const deleteFromDB = async (id: string): Promise<TAffirmation> => {
  const result = await Affirmation.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  ).lean()

  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Affirmation deletion failed!')
  }

  return result
}

export const AffirmationService = {
  insertIntoDB,
  getAllFromDB,
  getSingleFromDB,
  updateIntoDB,
  deleteFromDB,
}