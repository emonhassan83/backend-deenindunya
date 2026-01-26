import httpStatus from 'http-status'
import { TList } from './list.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { List } from './list.models'
import QueryBuilder from '../../builder/QueryBuilder'

// Create a new Project
const insertIntoDB = async (userId: string, payload: TList) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // Assign the user to the List
  payload.user = user._id

  const result = await List.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'List creation failed')
  }

  return result
}

// Get all assign project data
const getAllIntoDB = async (query: Record<string, any>) => {
  const listModel = new QueryBuilder(List.find(), query)
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await listModel.modelQuery
  const meta = await listModel.countTotal()
  return {
    data,
    meta,
  }
}

// Get Project by ID
const getAIntoDB = async (id: string) => {
  const result = await List.findById(id)
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! List not found!')
  }

  return result
}

// Toggle List status
const updateIntoDB = async (id: string, payload: TList) => {
  const list = await List.findById(id);
  if (!list) {
    throw new AppError(httpStatus.NOT_FOUND, "List not found!");
  }

  const result = await List.findByIdAndUpdate(
    id,
    payload,
    { new: true }
  );
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "List record not updated!"
    );
  }

  return result;
};

// Delete List
const deleteAIntoDB = async (id: string) => {
  const list = await List.findById(id)
  if (!list) {
    throw new AppError(httpStatus.NOT_FOUND, 'List not found!')
  }

  // todo: check dependencies before delete
  const result = await List.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'List deletion failed')
  }

  return result
}

export const ListService = {
  insertIntoDB,
  getAllIntoDB,
  getAIntoDB,
  updateIntoDB,
  deleteAIntoDB,
}
