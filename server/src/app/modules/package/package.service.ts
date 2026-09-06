import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import QueryBuilder from '../../builder/QueryBuilder'
import { TPackage } from './package.interface'
import { Package } from './package.model'

const createPackageIntoDB = async (payload: TPackage) => {
  const packages = await Package.create(payload)
  if (!packages) {
    throw new AppError(httpStatus.CONFLICT, 'Package not created!')
  }

  return packages
}

const getAllPackagesFromDB = async (query: Record<string, unknown>) => {
  const packageQuery = new QueryBuilder(
    Package.find({ isDeleted: false }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .fields()

  const result = await packageQuery.modelQuery

  return result
}

const updatePackageFromDB = async (id: string, payload: any) => {
  const packages = await Package.findById(id)
  if (!packages || packages?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Packages not found')
  }

  const updatePackage = await Package.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
  })
  if (!updatePackage) {
    throw new AppError(httpStatus.NOT_FOUND, 'Packages not updated')
  }

  return updatePackage
}

export const PackageService = {
  createPackageIntoDB,
  getAllPackagesFromDB,
  updatePackageFromDB,
}
