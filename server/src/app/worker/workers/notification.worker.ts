import { Worker, Job } from 'bullmq'
import { getRedisClient } from '../../config/redis.config'
import { Notification } from '../../modules/notification/notification.model'
import { getMessaging } from 'firebase-admin/messaging'
import moment from 'moment'

export const initializeNotificationWorker = () => {
  const connection = getRedisClient()

  const worker = new Worker(
    'notification-queue',
    async (job: Job) => {
      const { channel, receiver, message, description, model_type, reference, fcmTokens } = job.data
      console.log(`[Notification Worker] Processing job ${job.name}`)

      try {
        if (job.name === 'send-notification') {
          // 1. Socket notification (Save to DB & emit socket)
          if (channel === 'socket' || channel === 'both') {
            const payload = {
              receiver,
              message,
              description,
              model_type,
              reference,
            }
            await Notification.create(payload)

            //@ts-ignore
            const io = global?.socketio
            if (io) {
              const ver = 'notification::' + receiver
              io.emit(ver, { ...payload, createdAt: moment().format('YYYY-MM-DD') })
            }
            console.log(`[Notification Worker] Socket notification sent & saved to DB for user ${receiver}`)
          }

          // 2. Push notification (FCM)
          if (channel === 'push' || channel === 'both') {
            if (fcmTokens && fcmTokens.length > 0) {
              try {
                await getMessaging().sendEachForMulticast({
                  tokens: fcmTokens,
                  notification: {
                    title: message,
                    body: description,
                  },
                  apns: {
                    headers: {
                      'apns-push-type': 'alert',
                    },
                    payload: {
                      aps: {
                        badge: 1,
                        sound: 'default',
                      },
                    },
                  },
                })
                console.log(`[Notification Worker] Push notification sent to FCM tokens for user ${receiver}`)
              } catch (firebaseError) {
                console.warn(`[Notification Worker] Firebase FCM send failed:`, firebaseError)
              }
            } else {
              console.log(`[Notification Worker] FCM tokens missing/empty, skipped push notification for user ${receiver}`)
            }
          }
        }
      } catch (error) {
        console.error(`[Notification Worker] Job ${job.id} failed processing:`, error)
        throw error
      }
    },
    {
      connection: connection as any,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[Notification Worker] Job ${job?.id} failed:`, err)
  })

  console.log('[Notification Worker] Notification worker initialized')
  return worker
}
