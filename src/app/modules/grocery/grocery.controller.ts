import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { GroceryService } from './grocery.service'
import sendResponse from '../../utils/sendResponse'

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await GroceryService.insertIntoDB(req.body, req.user._id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grocery list insert successfully',
    data: result,
  })
})

const getAllIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await GroceryService.getAllIntoDB(req.query, req.user._id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grocery lists retrieved successfully',
    data: result,
  })
})

const toggleComplete = catchAsync(async (req: Request, res: Response) => {
  const result = await GroceryService.changedStatusIntoDB(req.params.id, req.user._id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grocery list updated successfully',
    data: result,
  })
})

const deleteAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await GroceryService.deleteAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grocery list deleted successfully',
    data: result,
  })
})

export const GroceryController = {
  insertIntoDB,
  getAllIntoDB,
  toggleComplete,
  deleteAIntoDB
}
