import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { contentsService } from './contents.service'
import sendResponse from '../../utils/sendResponse'

const getContent = catchAsync(async (req: Request, res: Response) => {
  const key = req.query.key as string
  const data = await contentsService.getContent(key)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Content retrieved successfully',
    data,
  })
})

const getContentGenerals = catchAsync(async (req: Request, res: Response) => {
  const data = await contentsService.getContentGenerals()

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'General contents retrieved successfully',
    data,
  })
})

const createOrUpdate = catchAsync(async (req: Request, res: Response) => {
  const key = req.params.key as string
  const data = await contentsService.createOrUpdate(key, req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Content updated successfully',
    data,
  })
})

const updateGenerals = catchAsync(async (req: Request, res: Response) => {
  await contentsService.updateGenerals(req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'General contents updated successfully',
    data: null,
  })
})

export const contentsController = {
  getContent,
  getContentGenerals,
  createOrUpdate,
  updateGenerals,
}
