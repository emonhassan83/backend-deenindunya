import httpStatus from 'http-status'
import { TRoom, TRoomTask } from './room.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Room, RoomTask } from './room.models'
import QueryBuilder from '../../builder/QueryBuilder'
import { isValidDate } from '../../utils/isValidDate'

// Create a new Room
const insertIntoDB = async (userId: string, payload: TRoom) => {
  const { name, logAt } = payload

  // validate user existence
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  // Validate date
  if (!isValidDate(logAt)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid date format. Use YYYY-MM-DD',
    )
  }

  // Check for duplicate room on same date
  const exists = await Room.findOne({
    user: userId,
    name: name,
    logAt: logAt,
  })

  if (exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Room already exists for this date',
    )
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

// Get all rooms with their tasks based on date
const getAllIntoDB = async (query: Record<string, any>, userId: string) => {
  const { date } = query

  // Validate date
  if (!date) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Date is required')
  }

  if (!isValidDate(date)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid date format. Use YYYY-MM-DD',
    )
  }

  // Validate user
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Get rooms for the date
  const rooms = await Room.find({
    user: userId,
    logAt: date,
  })
    .sort({ createdAt: -1 })
    .lean()

  // Get rooms with their tasks
  const roomsWithTasks = await Promise.all(
    rooms.map(async (room) => {
      // Get all tasks for this room
      const roomTasks = await RoomTask.find({
        room: room._id,
      })
        .sort({ createdAt: -1 })
        .lean()

      // Calculate statistics
      const totalTasks = roomTasks.length
      const completedTasks = roomTasks.filter(
        (task) => task.isCompleted === true,
      ).length
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        _id: room._id,
        name: room.name,
        logAt: room.logAt,
        roomTask: roomTasks.map((task) => ({
          _id: task._id,
          title: task.title,
          description: task.description,
          isCompleted: task.isCompleted,
        })),
        stats: {
          totalTasks,
          completedTasks,
          progress,
        },
      }
    }),
  )

  // Calculate overall statistics for the date
  const allRooms = roomsWithTasks
  const totalTasks = allRooms.reduce(
    (sum, room) => sum + room.stats.totalTasks,
    0,
  )
  const totalCompletedTasks = allRooms.reduce(
    (sum, room) => sum + room.stats.completedTasks,
    0,
  )
  const overallProgress =
    totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0

  return {
    totalTask: totalTasks,           // ✅ Total tasks across all rooms
    completedTask: totalCompletedTasks,
    progress: overallProgress,
    data: roomsWithTasks,
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
  await RoomTask.deleteMany({ room: id })

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
  deleteARoomTask,
}
