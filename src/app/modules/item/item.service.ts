import httpStatus from 'http-status'
import { TItem } from './item.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Item } from './item.models'
import QueryBuilder from '../../builder/QueryBuilder'

// Create a new Item
const insertIntoDB = async (userId: string, payload: TItem) => {
  const { list: listId } = payload

  // validate user existence
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // validate list ownership
  const list = await Item.findById(listId)
  if (!list) {
    throw new AppError(httpStatus.NOT_FOUND, 'List not found')
  }

  const result = await Item.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Item creation failed')
  }

  return result
}

// Get all item data
const getAllIntoDB = async (query: Record<string, any>) => {
  const itemModel = new QueryBuilder(Item.find(), query)
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await itemModel.modelQuery
  const meta = await itemModel.countTotal()

  return {
    data,
    meta,
  }
}

// Get Item by ID
const getAIntoDB = async (id: string) => {
  const result = await Item.findById(id)
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! Item not found!')
  }

  return result
}

// Toggle Item status
const updateIntoDB = async (id: string, payload: TItem) => {
  const item = await Item.findById(id)
  if (!item) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found!')
  }

  const updatedStatus = !item.isCompleted

  const result = await Item.findByIdAndUpdate(
    id,
    { isCompleted: updatedStatus },
    { new: true },
  )
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Item record not updated!',
    )
  }

  return result
}

// Delete Item
const deleteAIntoDB = async (id: string) => {
  const item = await Item.findById(id)
  if (!item) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found!')
  }

  const result = await Item.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Item deletion failed')
  }

  return result
}

export const ItemService = {
  insertIntoDB,
  getAllIntoDB,
  getAIntoDB,
  updateIntoDB,
  deleteAIntoDB,
}
