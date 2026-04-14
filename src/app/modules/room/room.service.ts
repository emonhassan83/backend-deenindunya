import httpStatus from 'http-status'
import { TRoom, TRoomTask } from './room.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Room, RoomTask } from './room.models'
import QueryBuilder from '../../builder/QueryBuilder'

// Create a new Room
const insertIntoDB = async (userId: string, payload: TRoom) => {
  // validate user existence
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // assign user
  payload.user = user._id

  const result = await Room.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room creation failed')
  }

  return result
}

const insertRoomTask = async (userId: string, payload: TRoomTask) => {
  const { room: roomId } = payload

  // validate user existence
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // validate user existence
  const room = await Room.findOne({ _id: roomId, user: userId })
  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found')
  }

  const result = await RoomTask.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room task creation failed')
  }

  return result
}

// Get all Room data
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

// Toggle Room task status
const toggleTaskStatus = async (id: string, userId: string) => {
  const task = await RoomTask.findById(id)
  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room task not found!')
  }

  const updatedStatus = !task.isCompleted

  const result = await RoomTask.findByIdAndUpdate(
    id,
    { isCompleted: updatedStatus },
    { new: true },
  )
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Room task record not updated!',
    )
  }

  return result
}

// Delete Room
const deleteAIntoDB = async (id: string) => {
  const room = await Room.findById(id)
  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found!')
  }

  //  here use transaction client
  await RoomTask.deleteMany({room: id})

  const result = await Room.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room deletion failed')
  }

  return result
}

// Delete Room
const deleteARoomTask = async (id: string) => {
  const task = await RoomTask.findById(id)
  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room task not found!')
  }

  const result = await RoomTask.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room task deletion failed')
  }

  return result
}

export const RoomService = {
  insertIntoDB,
  insertRoomTask,
  getAllIntoDB,
  toggleTaskStatus,
  deleteAIntoDB,
  deleteARoomTask
}
