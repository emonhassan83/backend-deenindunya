import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { MoodLogsService } from './moods.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await MoodLogsService.insertIntoDB(req.body)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Mood added successfully',
    data: result,
  })
})

const getAllMoods = catchAsync(async (req, res) => {
  const result = await MoodLogsService.getAllFromDB()

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Moods retrieved successfully',
    data: result,
  })
})

const deleteAFromDB = catchAsync(async (req, res) => {
  const result = await MoodLogsService.deleteAFromDB(req.params.id as string)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Mood delete successfully',
    data: result,
  })
})

const insertMoodLogs = catchAsync(async (req, res) => {
  const result = await MoodLogsService.insertMoodLogs(req.body, req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Mood logged successfully',
    data: result,
  })
})

const getAllMoodLogs = catchAsync(async (req, res) => {
  const result = await MoodLogsService.getAllMoodLogs(req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Mood logs retrieved successfully',
    data: result,
  })
})

export const MoodsControllers = {
  insertIntoDB,
  getAllMoods,
  deleteAFromDB,
  insertMoodLogs,
  getAllMoodLogs,
}
