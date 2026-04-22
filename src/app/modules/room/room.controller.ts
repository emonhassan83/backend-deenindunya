import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { RoomService } from './room.service'
import sendResponse from '../../utils/sendResponse'

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.insertIntoDB(req.user._id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Room insert successfully',
    data: result,
  })
})

const insertRoomTask = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.insertRoomTask(req.user._id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Room insert successfully',
    data: result,
  })
})

const getAllIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.getAllIntoDB(req.query, req.user._id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Rooms retrieved successfully',
    data: result,
  })
})

const toggleTaskStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.toggleTaskStatus(req.params.id, req.user._id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Room task status successfully',
    data: result,
  })
})

const deleteAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.deleteAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Room deleted successfully',
    data: result,
  })
})

const deleteARoomTask = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.deleteARoomTask(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Room task deleted successfully',
    data: result,
  })
})

export const RoomController = {
  insertIntoDB,
  insertRoomTask,
  getAllIntoDB,
  toggleTaskStatus,
  deleteAIntoDB,
  deleteARoomTask
}
