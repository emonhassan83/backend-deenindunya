import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { SunnahService } from './sunnah.service'
import sendResponse from '../../utils/sendResponse'

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SunnahService.insertIntoDB(req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sunnah insert successfully',
    data: result,
  })
})

const getAllIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SunnahService.getAllIntoDB(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sunnahs retrieved successfully',
    meta: result.meta,
    data: result.data,
  })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SunnahService.updateIntoDB(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sunnah updated successfully',
    data: result,
  })
})

const deleteAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SunnahService.deleteAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sunnah deleted successfully',
    data: result,
  })
})

const getUserSunnahs = catchAsync(async (req: Request, res: Response) => {
  const result = await SunnahService.getUserSunnahs(req.user._id, req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sunnah logs toggled successfully',
    meta: result.meta,
    data: result.data,
  })
})

const toggleLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await SunnahService.toggleSunnahLog(req.user._id, req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sunnah logs toggled successfully',
    data: result,
  })
})

export const SunnahController = {
  insertIntoDB,
  getAllIntoDB,
  updateIntoDB,
  deleteAIntoDB,
  toggleLogs,
  getUserSunnahs,
}
