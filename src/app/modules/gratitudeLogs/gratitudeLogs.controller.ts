import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { GratitudeLogsService } from './gratitudeLogs.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await GratitudeLogsService.insertIntoDB(req.body, req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Gratitude log created successfully',
    data: result,
  })
})

const getAllGratitudeLogs = catchAsync(async (req, res) => {
  const result = await GratitudeLogsService.getAllFromDB(
    req.user._id,
    req.query,
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Gratitude logs retrieved successfully',
    data: result.data,
    meta: result.meta,
  })
})

const updateGratitudeLog = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const result = await GratitudeLogsService.updateIntoDB(
    req.params.id,
    req.user._id,
    req.body,
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Gratitude log updated successfully',
    data: result,
  })
})

const deleteGratitudeLog = catchAsync(async (req, res) => {
  const result = await GratitudeLogsService.deleteFromDB(
    req.params.id,
    req.user._id,
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Gratitude log deleted successfully',
    data: result,
  })
})

export const GratitudeLogsControllers = {
  insertIntoDB,
  getAllGratitudeLogs,
  updateGratitudeLog,
  deleteGratitudeLog,
}
