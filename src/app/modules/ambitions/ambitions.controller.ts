import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { AmbitionService } from './ambitions.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await AmbitionService.insertIntoDB(req.body, req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Ambition created successfully',
    data: result,
  })
})

const getAllAmbitions = catchAsync(async (req, res) => {
  const result = await AmbitionService.getAllFromDB(req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Ambitions retrieved successfully',
    data: result
  })
})

const toggleComplete = catchAsync(async (req, res) => {
  const result = await AmbitionService.toggleCompleteStatus(
    req.params.id,
    req.user._id
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Ambition marked as ${result.isCompleted ? 'completed' : 'incomplete'}`,
    data: result,
  })
})

const deleteAmbition = catchAsync(async (req, res) => {
  const result = await AmbitionService.deleteFromDB(req.params.id, req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Ambition deleted successfully',
    data: result,
  })
})

export const AmbitionControllers = {
  insertIntoDB,
  getAllAmbitions,
  toggleComplete,
  deleteAmbition,
}