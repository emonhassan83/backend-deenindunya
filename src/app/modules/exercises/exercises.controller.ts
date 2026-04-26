import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { ExerciseService } from './exercises.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await ExerciseService.insertIntoDB(req.body, req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Exercise created successfully',
    data: result,
  })
})

const getAllExercises = catchAsync(async (req, res) => {
  const result = await ExerciseService.getAllFromDB(req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Exercises retrieved successfully',
    data: result,
  })
})

const updateExercise = catchAsync(async (req, res) => {
  const result = await ExerciseService.updateIntoDB(
    req.params.id,
    req.user._id,
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
  const result = await ExerciseService.toggleCompleteStatus(
    req.params.id,
    req.user._id
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Exercise marked as ${result.isCompleted ? 'completed' : 'incomplete'}`,
    data: result,
  })
})

const deleteExercise = catchAsync(async (req, res) => {
  const result = await ExerciseService.deleteFromDB(req.params.id, req.user._id)

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