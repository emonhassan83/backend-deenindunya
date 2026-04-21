import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { EventService } from './event.service'
import sendResponse from '../../utils/sendResponse'

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.insertIntoDB(req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event insert successfully',
    data: result,
  })
})

const getIslamicEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getCurrentYearIslamicEvents(req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Events retrieved successfully',
    data: result,
  })
})

const getAllEventsForUser = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getAllEventsForUser(req.user._id, req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Events retrieved successfully',
    data: result,
  })
})

// Get events by specific date
const getEventsByDate = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getEventsByDate(
    req.user._id,
    req.query,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Events for ${req.query.date} retrieved successfully`,
    data: result,
  })
})

// Get all events (Islamic + User) by month - Simplified (only hasEvent)
const getAllEventsByMonth = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getAllEventsByMonth(req.user._id, req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Events retrieved successfully`,
    data: result,
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
  getIslamicEvents,
  getAllEventsForUser,
  getEventsByDate,
  getAllEventsByMonth,
  updateIntoDB,
  deleteAIntoDB,
}
