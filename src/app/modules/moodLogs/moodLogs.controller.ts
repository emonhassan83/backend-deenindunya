import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { MoodLogsService } from './moodLogs.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const userId = req.user.userId // From auth middleware
  const result = await MoodLogsService.insertIntoDB(req.body, userId)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Mood logged successfully',
    data: result,
  })
})

const getAllMoodLogs = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const result = await MoodLogsService.getAllFromDB(userId, req.query)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Mood logs retrieved successfully',
    data: result.data,
    meta: result.meta,
  })
})

export const MoodLogsControllers = {
  insertIntoDB,
  getAllMoodLogs
}