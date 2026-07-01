import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TDuas } from './duas.interface'
import { Duas } from './duas.model'

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
  return result
}

const getAllFromDB = async (query: Record<string, unknown>) => {
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

const getSingleFromDB = async (id: string): Promise<TDuas> => {
  const result = await Duas.findById(id)
    .populate('category', 'title')
    .select('-isDeleted')
    .lean()

  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Dua not found!')
  }

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

  return result
}

export const DuasService = {
  insertIntoDB,
  getAllFromDB,
  getSingleFromDB,
  updateIntoDB,
  deleteFromDB,
}