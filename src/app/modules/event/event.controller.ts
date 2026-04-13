import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { EventService } from './event.service'
import sendResponse from '../../utils/sendResponse'
import { EVENT_TYPE } from './event.constants'

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.insertIntoDB(req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event insert successfully',
    data: result,
  })
})

const getAllIntoDB = catchAsync(async (req: Request, res: Response) => {
  req.query['type'] = EVENT_TYPE.islamic
  const result = await EventService.getAllIntoDB(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Events retrieved successfully',
    meta: result.meta,
    data: result.data,
  })
})

const getMyEvent = catchAsync(async (req: Request, res: Response) => {
  req.query['type'] = EVENT_TYPE.user
  req.query['user'] = req.user._id
  const result = await EventService.getAllIntoDB(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My event toggled successfully',
    meta: result.meta,
    data: result.data,
  })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.updateIntoDB(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event updated successfully',
    data: result,
  })
})

const deleteAIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.deleteAIntoDB(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event deleted successfully',
    data: result,
  })
})

export const EventController = {
  insertIntoDB,
  getAllIntoDB,
  updateIntoDB,
  deleteAIntoDB,
  getMyEvent,
}
