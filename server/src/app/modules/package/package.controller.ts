import catchAsync from '../../utils/catchAsync'
import httpStatus from 'http-status'
import sendResponse from '../../utils/sendResponse'
import { PackageService } from './package.service'

const createPackage = catchAsync(async (req, res) => {
  const result = await PackageService.createPackageIntoDB(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Package created successfully!',
    data: result,
  })
})

const getAllPackages = catchAsync(async (req, res) => {
  const result = await PackageService.getAllPackagesFromDB(req.query)

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Packages retrieved successfully!',
    meta: result.meta,
    data: result.result,
  })
})

const updatePackage = catchAsync(async (req, res) => {
  const result = await PackageService.updatePackageFromDB(
    req.params.id as string,
    req.body,
  )

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Package updated successfully!',
    data: result,
  })
})

export const PackageControllers = {
  createPackage,
  getAllPackages,
  updatePackage
}
