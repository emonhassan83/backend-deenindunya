import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { WaterIntakeService } from './waterIntake.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const userId = req.user.userId // From auth middleware
  const result = await WaterIntakeService.insertIntoDB(req.body, userId)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Water intake logged successfully',
    data: result,
  })
})

const getAllWaterIntakes = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const result = await WaterIntakeService.getAllFromDB(userId, req.query)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Water intake records retrieved successfully',
    data: result.data,
    meta: result.meta,
  })
})

const deleteWaterIntake = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const result = await WaterIntakeService.deleteFromDB(req.params.id, userId)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Water intake record deleted successfully',
    data: result,
  })
})

export const WaterIntakeControllers = {
  insertIntoDB,
  getAllWaterIntakes,
  deleteWaterIntake,
}