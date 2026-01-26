import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { ListService } from './item.service'
import sendResponse from '../../utils/sendResponse'

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ListService.insertIntoDB(req.user._id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'List insert successfully',
    data: result,
  })
})

const getAllIntoDB = catchAsync(async (req: Request, res: Response) => {
  req.query['user'] = req.user._id
  const result = await ListService.getAllIntoDB(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Lists retrieved successfully',
    meta: result.meta,
    data: result.data,
  })
})

// Get Project by ID
const getAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ListService.getAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'List retrieved successfully',
    data: result,
  })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ListService.updateIntoDB(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'List updated successfully',
    data: result,
  })
})

const deleteAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ListService.deleteAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'List deleted successfully',
    data: result,
  })
})

export const ListController = {
  insertIntoDB,
  getAllIntoDB,
  getAIntoDB,
  updateIntoDB,
  deleteAIntoDB
}
