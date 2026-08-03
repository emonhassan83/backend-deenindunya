import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { WaterIntakeService } from './waterIntake.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await WaterIntakeService.insertIntoDB(req.body, req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Water intake logged successfully',
    data: result,
  })
})

const getAllWaterIntakes = catchAsync(async (req, res) => {
  const result = await WaterIntakeService.getAllFromDB(req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Water intake records retrieved successfully',
    data: result,
  })
})

const setDailyTarget = catchAsync(async (req, res) => {
  const result = await WaterIntakeService.setDailyTarget(req.user._id, req.body)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Daily water target updated successfully',
    data: result,
  })
})

export const WaterIntakeControllers = {
  insertIntoDB,
  getAllWaterIntakes,
  setDailyTarget,
}
