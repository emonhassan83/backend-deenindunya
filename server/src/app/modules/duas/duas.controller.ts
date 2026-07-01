import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { DuasService } from './duas.service'

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await DuasService.insertIntoDB(req.body)

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Dua created successfully',
    data: result,
  })
})

const getAllDuas = catchAsync(async (req, res) => {
  const result = await DuasService.getAllFromDB(req.query)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Duas retrieved successfully',
    data: result.data,
    meta: result.meta,
  })
})

const getSingleDua = catchAsync(async (req, res) => {
  const result = await DuasService.getSingleFromDB(req.params.id as string)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Dua retrieved successfully',
    data: result,
  })
})

const updateDua = catchAsync(async (req, res) => {
  const result = await DuasService.updateIntoDB(req.params.id as string, req.body)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Dua updated successfully',
    data: result,
  })
})

const deleteDua = catchAsync(async (req, res) => {
  const result = await DuasService.deleteFromDB(req.params.id as string)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Dua deleted successfully',
    data: result,
  })
})

export const DuasControllers = {
  insertIntoDB,
  getAllDuas,
  getSingleDua,
  updateDua,
  deleteDua,
}