import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { AffirmationService } from './affirmations.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await AffirmationService.insertIntoDB(req.body)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Affirmation created successfully',
    data: result,
  })
})

const getAllAffirmations = catchAsync(async (req, res) => {
  const result = await AffirmationService.getAllFromDB(req.query)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Affirmations retrieved successfully',
    data: result.data,
    meta: result.meta,
  })
})

const getSingleAffirmation = catchAsync(async (req, res) => {
  const result = await AffirmationService.getSingleFromDB(req.params.id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Affirmation retrieved successfully',
    data: result,
  })
})

const updateAffirmation = catchAsync(async (req, res) => {
  const result = await AffirmationService.updateIntoDB(req.params.id, req.body)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Affirmation updated successfully',
    data: result,
  })
})

const deleteAffirmation = catchAsync(async (req, res) => {
  const result = await AffirmationService.deleteFromDB(req.params.id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Affirmation deleted successfully',
    data: result,
  })
})

export const AffirmationControllers = {
  insertIntoDB,
  getAllAffirmations,
  getSingleAffirmation,
  updateAffirmation,
  deleteAffirmation,
}