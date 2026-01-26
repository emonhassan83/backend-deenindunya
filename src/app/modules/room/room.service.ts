import httpStatus from 'http-status'
import { TRoom } from './room.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Room } from './room.models'
import QueryBuilder from '../../builder/QueryBuilder'

// Create a new Project
const insertIntoDB = async (userId: string, payload: TRoom) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // Assign the user to the Room
  payload.user = user._id

  const result = await Room.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room creation failed')
  }

  return result
}

// Get all assign project data
const getAllIntoDB = async (query: Record<string, any>) => {
  const roomModel = new QueryBuilder(Room.find(), query)
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields()

  const data = await roomModel.modelQuery
  const meta = await roomModel.countTotal()
  return {
    data,
    meta,
  }
}

// Get Project by ID
const getAIntoDB = async (id: string) => {
  const result = await Room.findById(id)
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! Room not found!')
  }

  return result
}

// Toggle Room status
const updateIntoDB = async (id: string, payload: TRoom) => {
  const room = await Room.findById(id);
  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, "Room not found!");
  }

  const result = await Room.findByIdAndUpdate(
    id,
    payload,
    { new: true }
  );
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Room record not updated!"
    );
  }

  return result;
};

// Delete Room
const deleteAIntoDB = async (id: string) => {
  const room = await Room.findById(id)
  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!')
  }

  const result = await Room.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room deletion failed')
  }

  return result
}

export const RoomService = {
  insertIntoDB,
  getAllIntoDB,
  getAIntoDB,
  updateIntoDB,
  deleteAIntoDB,
}
