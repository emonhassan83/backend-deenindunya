import httpStatus from 'http-status'
import { TContents } from './contents.interface'
import QueryBuilder from '../../builder/QueryBuilder'
import { Contents } from './contents.models'
import AppError from '../../errors/AppError'

// Get all contents
const getAllContents = async (query: Record<string, any>) => {
  const ContentModel = new QueryBuilder(
    // @ts-ignore
    Contents.find({ isDeleted: false }).select(
      'termsAndConditions  privacyPolicy waterIntake',
    ),
    query,
  )
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await ContentModel.modelQuery
  const meta = await ContentModel.countTotal()
  return {
    data,
    meta,
  }
}

// Update content
const updateContents = async (payload: Partial<TContents>) => {
  const content = await Contents.findOne()
  if (!content) {
    throw new AppError(httpStatus.NOT_FOUND, 'Content not found!')
  }

  // Update the content document
  Object.assign(content, payload)
  await content.save()

  return content
}

export const contentsService = {
  getAllContents,
  updateContents,
}
