import AppError from '../../errors/AppError'
import httpStatus from 'http-status'
import { User } from '../user/user.model'

const userMeta = async (userId: string) => {
  // Check if category with same normalized title already exists
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
}

const adminMeta = async () => {}

export const MetaService = {
  userMeta,
  adminMeta,
}
