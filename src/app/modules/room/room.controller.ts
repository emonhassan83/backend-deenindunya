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

const getAllIntoDB = catchAsync(async (req: Request, res: Response) => {
  req.query['user'] = req.user._id
  const result = await RoomService.getAllIntoDB(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Rooms retrieved successfully',
    meta: result.meta,
    data: result.data,
  })
})

// Get Project by ID
const getAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.getAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Room retrieved successfully',
    data: result,
  })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.updateIntoDB(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Room updated successfully',
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

export const RoomController = {
  insertIntoDB,
  getAllIntoDB,
  getAIntoDB,
  updateIntoDB,
  deleteAIntoDB
}
