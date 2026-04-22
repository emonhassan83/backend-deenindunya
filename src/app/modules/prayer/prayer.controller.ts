import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { PrayerService } from './prayer.service'
import sendResponse from '../../utils/sendResponse'

const createBulkPrayers = catchAsync(async (req: Request, res: Response) => {
  const result = await PrayerService.createBulkPrayers(req.user._id, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: '5 prayers created successfully for the date',
    data: result,
  })
})

const getPrayersByDate = catchAsync(async (req: Request, res: Response) => {
  const result = await PrayerService.getPrayersByDate(
    req.user._id,
    req.query,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Prayers retrieved successfully for the date',
    data: result,
  })
})

const togglePrayerStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await PrayerService.togglePrayerStatus(
    req.params.id,
    req.user._id,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Prayer status toggled successfully',
    data: result,
  })
})

const completedPayers = catchAsync(async (req: Request, res: Response) => {
  const result = await PrayerService.completedPayers(
    req.user._id,
    req.query,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Completed payers successfully',
    data: result,
  })
})

const getPrayerTimes = catchAsync(async (req: Request, res: Response) => {
  const result = await PrayerService.getPrayerTimes(req.user._id, req.query)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Prayer times fetched successfully',
    data: result,
  })
})

export const PrayerController = {
  createBulkPrayers,
  getPrayersByDate,
  togglePrayerStatus,
  getPrayerTimes,
  completedPayers
}
