import httpStatus from 'http-status'
import { TRoom, TRoomTask } from './room.interface'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { Room, RoomTask } from './room.models'
import QueryBuilder from '../../builder/QueryBuilder'
import { isValidDate } from '../../utils/isValidDate'
import { getCache, setCache, deleteCachePattern } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.ROOM_PATTERN(userId))

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
  const room = await Room.findOne({ _id: roomId.toString(), user: userId })
  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found')
  }

  const result = await RoomTask.create(payload)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room task creation failed')
  }

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.ROOM_PATTERN(userId))

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

  const cacheKey = REDIS_KEYS.ROOM_KEY(userId, date)
  const cachedData = await getCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Get rooms for the date
  const rooms = await Room.find({
    user: userId,
    logAt: date,
  })
    .sort({ createdAt: -1 })
    .lean()

  // Get room tasks for all fetched rooms
  const roomIds = rooms.map((r) => r._id)

  const tasks = await RoomTask.find({
    room: { $in: roomIds },
  })
    .sort({ createdAt: -1 })
    .lean()

  // Group tasks by room ID
  const tasksByRoom = tasks.reduce(
    (acc, task) => {
      const roomIdStr = task.room.toString()
      if (!acc[roomIdStr]) {
        acc[roomIdStr] = []
      }
      acc[roomIdStr].push(task)
      return acc
    },
    {} as Record<string, any[]>,
  )

  // Enriched rooms with their tasks and progress
  const roomsWithTasks = rooms.map((room) => {
    const roomTasks = tasksByRoom[room._id.toString()] || []
    const totalTasks = roomTasks.length
    const completedTasks = roomTasks.filter((t) => t.isCompleted).length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      ...room,
      progress,
      roomTasks,
    }
  })

  // Calculate overall progress across all rooms
  const totalTasksAllRooms = tasks.length
  const totalCompletedTasks = tasks.filter((t) => t.isCompleted).length
  const overallProgress = totalTasksAllRooms > 0 ? Math.round((totalCompletedTasks / totalTasksAllRooms) * 100) : 0

  const result = {
    totalRoom: rooms.length,
    completedTask: totalCompletedTasks,
    progress: overallProgress,
    data: roomsWithTasks,
  }

  await setCache(cacheKey, result)

  return result
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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.ROOM_PATTERN(userId))

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

  // Invalidate cache
  await deleteCachePattern(REDIS_KEYS.ROOM_PATTERN(String(room.user)))

  return result
}

// Delete Room Task
const deleteARoomTask = async (id: string) => {
  const task = await RoomTask.findById(id)
  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room task not found!')
  }

  const room = await Room.findById(task.room)

  const result = await RoomTask.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room task deletion failed')
  }

  if (room) {
    // Invalidate cache
    await deleteCachePattern(REDIS_KEYS.ROOM_PATTERN(String(room.user)))
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
