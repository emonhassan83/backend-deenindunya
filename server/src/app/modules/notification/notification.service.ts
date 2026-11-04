import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import QueryBuilder from '../../builder/QueryBuilder'
import { TNotification } from './notification.interface'
import { Notification } from './notification.model'
import { User } from '../user/user.model'
import { getNotificationQueue } from '../../queues/queues'

const createNotificationIntoDB = async (payload: TNotification) => {
  if (!payload.receiver) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Receiver is required')
  }

  const receiver = await User.findOne({
    _id: payload.receiver,
    isDeleted: false,
  })
    .select('_id name email fcmToken status')
    .lean()

  if (!receiver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Receiver user not found')
  }

  const fcmTokens = receiver.fcmToken ? [receiver.fcmToken] : []

  const queue = getNotificationQueue()
  const job = await queue.add(
    'send-notification',
    {
      // Save in-app notification + emit socket + send FCM push when token exists
      channel: 'both',
      receiver: receiver._id.toString(),
      message: payload.message,
      description: payload.description || '',
      model_type: payload.model_type,
      reference: payload.reference,
      fcmTokens,
    },
    {
      priority: 1,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    },
  )

  return {
    enqueued: true,
    jobId: job.id,
    receiver: {
      _id: receiver._id,
      name: receiver.name,
      email: receiver.email,
    },
    pushScheduled: fcmTokens.length > 0,
  }
}

const getAllNotificationFromDB = async (query: Record<string, unknown>) => {
  const notificationQuery = new QueryBuilder(Notification.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await notificationQuery.modelQuery
  const meta = await notificationQuery.countTotal()
  if (!notificationQuery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found!')
  }

  return {
    meta,
    result,
  }
}

const markAsDoneFromDB = async (id: string) => {
  const result = await Notification.updateMany(
    { receiver: id },
    {
      $set: {
        read: true,
      },
    },
  )

  return result
}

const deleteANotificationFromDB = async (id: string) => {
  const notification = await Notification.findById(id)
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found!')
  }

  const result = await Notification.findByIdAndDelete(id)
  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification not found and failed to delete!',
    )
  }

  return result
}

const deleteAllNotificationsFromDB = async (userId: string) => {
  const result = await Notification.deleteMany({ receiver: userId })
  if (result.deletedCount === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No notifications found or already deleted!',
    )
  }

  return result
}

export const NotificationService = {
  createNotificationIntoDB,
  getAllNotificationFromDB,
  markAsDoneFromDB,
  deleteANotificationFromDB,
  deleteAllNotificationsFromDB,
}
