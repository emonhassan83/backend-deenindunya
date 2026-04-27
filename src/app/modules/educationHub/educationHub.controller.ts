import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { EducationHubService } from './educationHub.service'
import sendResponse from '../../utils/sendResponse'

const getModules = catchAsync(async (req: Request, res: Response) => {
  const result = await EducationHubService.getModules(req.user._id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Modules retrieved successfully!',
    data: result.data,
  })
})

const getModuleLessons = catchAsync(async (req: Request, res: Response) => {
  const result = await EducationHubService.getModuleLessons(
    req.params.moduleId,
    req.user._id
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Module lesson fetched successfully',
    data: result,
  })
})

const getLessonsByType = catchAsync(async (req: Request, res: Response) => {
  const result = await EducationHubService.getLessonsByType(
    req.query,
    req.user._id
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Module lesson fetched successfully',
    data: result,
  })
})

const readLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await EducationHubService.readLesson(
    req.params.id,
    req.user._id,
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Lesson read successfully',
    data: result,
  })
})

export const EducationHubController = {
  getModules,
  getModuleLessons,
  getLessonsByType,
  readLesson,
}
