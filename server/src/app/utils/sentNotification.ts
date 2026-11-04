import AppError from '../errors/AppError'
import httpStatus from 'http-status'
import { TNotification } from '../modules/notification/notification.interface'
import { getNotificationQueue } from '../queues/queues'
import { getFirebaseApp } from '../config/firebase.config'

// Ensure Firebase Admin is initialized for any FCM send path.
getFirebaseApp()

export const sendNotification = async (
  fcmToken: string[],
  payload: TNotification,
): Promise<{ enqueued: boolean }> => {
  try {
    const queue = getNotificationQueue()
    await queue.add('send-notification', {
      channel: 'push',
      receiver: payload.receiver,
      message: payload.message,
      description: payload.description,
      model_type: payload.model_type,
      reference: payload.reference,
      fcmTokens: fcmToken.filter(Boolean),
    })
    return { enqueued: true }
  } catch (error) {
    console.error('Error enqueuing notification job:', error)
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to enqueue notification',
    )
  }
}
