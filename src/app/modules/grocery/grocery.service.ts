import mongoose from 'mongoose'
import httpStatus from 'http-status'
import { TGrocery } from './grocery.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Grocery } from './grocery.models'
import QueryBuilder from '../../builder/QueryBuilder'

// Create a new Project
const insertIntoDB = async (userId: string, payload: TGrocery) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // Assign the user to the Grocery
  payload.user = user._id

  const result = await Grocery.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Grocery creation failed')
  }

  return result
}

// Get all assign project data
const getAllIntoDB = async (query: Record<string, any>) => {
  const groceryModel = new QueryBuilder(Grocery.find(), query)
    .search(['name'])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await groceryModel.modelQuery
  const meta = await groceryModel.countTotal()
  return {
    data,
    meta,
  }
}

// Toggle Grocery status
const changedStatusIntoDB = async (id: string, userId: string) => {
  const grocery = await Grocery.findOne({ _id: id, user: userId })
  if (!grocery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Grocery not found!')
  }

  const updatedStatus = !grocery.isCompleted
  const result = await Grocery.findByIdAndUpdate(
    id,
    { isCompleted: updatedStatus },
    { new: true },
  )
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Grocery record not updated!',
    )
  }

  return result
}

// Delete Grocery
const deleteAIntoDB = async (id: string) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const grocery = await Grocery.findById(id).session(session)
    if (!grocery) {
      throw new AppError(httpStatus.NOT_FOUND, 'Grocery not found!')
    }

    // Delete the Grocery
    const result = await Grocery.findByIdAndDelete(id).session(session)
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Grocery deletion failed')
    }

    await session.commitTransaction()
    session.endSession()

    return result
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

export const GroceryService = {
  insertIntoDB,
  getAllIntoDB,
  changedStatusIntoDB,
  deleteAIntoDB,
}
