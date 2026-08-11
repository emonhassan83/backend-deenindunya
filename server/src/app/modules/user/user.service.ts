import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { TUser } from './user.interface'
import { User } from './user.model'
import QueryBuilder from '../../builder/QueryBuilder'
import { USER_ROLE, USER_STATUS } from './user.constant'
import {
  sendUserStatusNotifYToAdmin,
  sendUserStatusNotifYToUser,
} from './user.utils'
import bcrypt from 'bcrypt'
import { Subscription } from '../subscription/subscription.models'
import { SUBSCRIPTION_STATUS } from '../subscription/subscription.constants'

const generateLocationUrl = (lat: number, lng: number) => {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

const registerUserIntoDB = async (payload: TUser) => {
  // ❌ Prevent admin creation directly
  if (payload.role === USER_ROLE.admin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You cannot directly assign admin role',
    )
  }

  /* =========================================================
     ✅ Existing user check
     ========================================================= */
  const existingUser = await User.findOne({ email: payload.email })

  if (existingUser) {
    // 🟡 Soft-deleted user → restore
    if (existingUser.isDeleted) {
      existingUser.set({
        ...payload,
        isDeleted: false,
      })
      return await existingUser.save()
    }

    // 🟡 Unverified user → update & reuse
    if (!existingUser.isSignUpOtpVerified) {
      existingUser.set(payload)
      return await existingUser.save()
    }

    // 🔴 Active user already exists
    throw new AppError(
      httpStatus.CONFLICT,
      'User already exists with this email',
    )
  }

  /* =========================================================
     ✅ Create new user
     ========================================================= */
  // if (!payload.password) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Password is required')
  // }

  const newUser = await User.create(payload)
  return newUser
}

const setUserPasswordFromDB = async (
  userId: string,
  payload: { password: string; confirmPassword: string },
) => {
  const { password, confirmPassword } = payload

  if (password !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password and confirm password do not match',
    )
  }

  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  if (!password || !confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password and confirm password are required',
    )
  }

  if (user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password already set. Please use change password instead',
    )
  }

  // 🔑 পাসওয়ার্ড hash করা হচ্ছে
  const hashedPassword = await bcrypt.hash(password, 10)

  await User.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
    { new: true },
  )

  return
}

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const activeUserCount = await User.countDocuments({
    isDeleted: false,
    role: { $ne: USER_ROLE.admin },
    status: USER_STATUS.active,
  })

  const usersQuery = new QueryBuilder(
    User.find({ isDeleted: false, role: { $ne: USER_ROLE.admin } }).select(
      '_id id name email photoUrl address contractNumber status createdAt',
    ),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await usersQuery.modelQuery
  const meta = await usersQuery.countTotal()

  return {
    meta,
    result: {
      totalUser: meta.total,
      activeUser: activeUserCount,
      userList: result,
    },
  }
}

const geUserByIdFromDB = async (id: string) => {
  const user = await User.findById(id).select(
    '_id id name email photoUrl country address contractNumber location locationUrl timezone notificationPreference status isEnabledFreeTrial freeTrialExpiry hasUsedFreeTrial createdAt',
  );

  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const now = new Date();
  const isActiveFreeTrial =
    user.isEnabledFreeTrial &&
    user.freeTrialExpiry &&
    new Date(user.freeTrialExpiry) > now;

  const activeSubscription = await Subscription.findOne({
    user: id,
    status: {
      $in: [
        SUBSCRIPTION_STATUS.active,
        SUBSCRIPTION_STATUS.cancelled,
        SUBSCRIPTION_STATUS.grace_period,
        SUBSCRIPTION_STATUS.billing_issue,
      ],
    },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .populate('package', 'title billingCycle revenueCatProductId entitlementId')
    .lean();

  const userObject = user.toObject();
  (userObject as any).isActiveSubscription = !!activeSubscription;
  (userObject as any).subscriptionType =
    activeSubscription?.productId || activeSubscription?.entitlementId || null;
  (userObject as any).billingCycle =
    (activeSubscription?.package as any)?.billingCycle || null;
  (userObject as any).expiresAt = activeSubscription?.expiresAt || null;
  (userObject as any).entitlementId = activeSubscription?.entitlementId || null;
  (userObject as any).revenueCatProductId =
    activeSubscription?.productId || null;
  (userObject as any).isActiveFreeTrial = !!isActiveFreeTrial;

  return userObject;
};

const changeUserStatusFromDB = async (payload: any) => {
  const { userId, status } = payload

  //* if the user is is not exist
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  const updateUserStatus = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true },
  ).select('_id id name email photoUrl contactNumber status')
  if (!updateUserStatus) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found and failed to update status!',
    )
  }

  // Send notification to both user and admin
  await sendUserStatusNotifYToUser(status, updateUserStatus)
  await sendUserStatusNotifYToAdmin(status, updateUserStatus)

  return updateUserStatus
}

const changeUserNotifyFromDB = async (payload: any, userId: string) => {
  //* if the user is is not exist
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  const result = await User.findByIdAndUpdate(
    user._id,
    { payload },
    { new: true },
  ).select('_id id name email photoUrl contactNumber status notificationPreference')
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User notify update failed!')
  }

  return result
}

const updateUserInfoFromDB = async (
  userId: string,
  payload: Partial<TUser> & {
    latitude?: number
    longitude?: number
  },
) => {
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const updateData: Partial<TUser> = { ...payload }

  /* =======================
     MAIN BUSINESS LOCATION
  ======================= */
  if (payload.latitude && payload.longitude) {
    updateData.location = {
      type: 'Point',
      coordinates: [payload.longitude, payload.latitude],
    }

    updateData.locationUrl = generateLocationUrl(
      payload.latitude,
      payload.longitude,
    )

    delete (updateData as any).latitude
    delete (updateData as any).longitude
  }

  return await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  })
}

const updateLocationFromDB = async (
  userId: string,
  payload: {
    longitude: number
    latitude: number
    address?: string
    timezone?: string
  },
) => {
  const { longitude, latitude, address, timezone } = payload

  //* if the user is is not exist
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  if (!longitude || !latitude) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Longitude and latitude are required',
    )
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      location: { type: 'Point', coordinates: [longitude, latitude] },
      ...(address && { address }),
      ...(timezone && { timezone }),
      ...(latitude && { latitude }),
      ...(longitude && { longitude }),
    },
    { new: true },
  )

  return updatedUser
}

const enabledFreeTier = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  if (user.hasUsedFreeTrial) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Free trial has already been used.',
    )
  }

  if (
    user.isEnabledFreeTrial &&
    user.freeTrialExpiry &&
    new Date(user.freeTrialExpiry) > new Date()
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Free trial is already active.')
  }

  const freeTrialExpiry = new Date()
  freeTrialExpiry.setDate(freeTrialExpiry.getDate() + 7)

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      isEnabledFreeTrial: true,
      freeTrialExpiry,
      hasUsedFreeTrial: true,
    },
    { new: true },
  ).select(
    '_id id name email photoUrl status isEnabledFreeTrial freeTrialExpiry hasUsedFreeTrial',
  )

  if (!updatedUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to activate free trial.',
    )
  }

  return updatedUser
}

const deleteAUserFromDB = async (userId: string) => {
  //* Check if the user exists
  const user = await User.findById(userId).select('_id')
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
  }

  // Use `Promise.all` to execute updates in parallel
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true },
  ).select('_id id name email photoUrl contactNumber status isDeleted')

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Failed to update user status!')
  }

  return updatedUser
}

export const UserService = {
  registerUserIntoDB,
  setUserPasswordFromDB,
  getAllUsersFromDB,
  geUserByIdFromDB,
  changeUserStatusFromDB,
  changeUserNotifyFromDB,
  updateUserInfoFromDB,
  updateLocationFromDB,
  enabledFreeTier,
  deleteAUserFromDB,
}
