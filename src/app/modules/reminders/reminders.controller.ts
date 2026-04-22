import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { ReminderService } from './reminders.service'
import sendResponse from '../../utils/sendResponse'

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ReminderService.insertIntoDB(req.user._id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reminder created successfully',
    data: result,
  })
})

const getAllIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ReminderService.getAllIntoDB(req.user._id, req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reminders retrieved successfully',
    data: result,
  })
})

const toggleCompleteIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ReminderService.toggleCompleteIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reminder status toggled successfully',
    data: result,
  })
})

const deleteAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ReminderService.deleteAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reminder deleted successfully',
    data: result,
  })
})

export const ReminderController = {
  insertIntoDB,
  getAllIntoDB,
  toggleCompleteIntoDB,
  deleteAIntoDB
}