import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { MetaService } from './meta.service'

const userMeta = catchAsync(async (req, res) => {
  const result = await MetaService.userMeta(req.user._id)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User meta retrieve successfully",
    data: result,
  })
})

const adminMeta = catchAsync(async (req, res) => {
  const result = await MetaService.adminMeta()

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Categories retrieved successfully!',
    data: result,
  })
})


export const MetaControllers = {
  userMeta,
  adminMeta
}
