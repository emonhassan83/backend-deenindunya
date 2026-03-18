import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { ExerciseService } from './exercises.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const userId = req.user.userId // From auth middleware
  const result = await ExerciseService.insertIntoDB(req.body, userId)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Exercise created successfully',
    data: result,
  })
})

const getAllExercises = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const result = await ExerciseService.getAllFromDB(userId, req.query)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Exercises retrieved successfully',
    data: result.data,
    meta: result.meta,
  })
})

const updateExercise = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const result = await ExerciseService.updateIntoDB(
    req.params.id,
    userId,
    req.body
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Exercise updated successfully',
    data: result,
  })
})

const toggleComplete = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const result = await ExerciseService.toggleCompleteStatus(
    req.params.id,
    userId
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Exercise marked as ${result.isCompleted ? 'completed' : 'incomplete'}`,
    data: result,
  })
})

const deleteExercise = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const result = await ExerciseService.deleteFromDB(req.params.id, userId)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Exercise deleted successfully',
    data: result,
  })
})

export const ExerciseControllers = {
  insertIntoDB,
  getAllExercises,
  updateExercise,
  toggleComplete,
  deleteExercise,
}