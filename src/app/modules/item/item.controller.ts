import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { ItemService } from './item.service'
import sendResponse from '../../utils/sendResponse'

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.insertIntoDB(req.user._id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Item insert successfully',
    data: result,
  })
})

const getAllIntoDB = catchAsync(async (req: Request, res: Response) => {
  req.query['user'] = req.user._id
  const result = await ItemService.getAllIntoDB(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Items retrieved successfully',
    meta: result.meta,
    data: result.data,
  })
})

// Get Project by ID
const getAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.getAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Item retrieved successfully',
    data: result,
  })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.updateIntoDB(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Item updated successfully',
    data: result,
  })
})

const deleteAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.deleteAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Item deleted successfully',
    data: result,
  })
})

export const ItemController = {
  insertIntoDB,
  getAllIntoDB,
  getAIntoDB,
  updateIntoDB,
  deleteAIntoDB
}
