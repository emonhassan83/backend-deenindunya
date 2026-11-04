import { Worker, Job } from 'bullmq'
import { getRedisClient } from '../../config/redis.config'
import { getFirebaseApp } from '../../config/firebase.config'
import { Notification } from '../../modules/notification/notification.model'
import { getMessaging } from 'firebase-admin/messaging'
import moment from 'moment'

export const initializeNotificationWorker = () => {
  // Ensure Firebase Admin is ready before any FCM send.
  getFirebaseApp()

  const connection = getRedisClient()

  const worker = new Worker(
    'notification-queue',
    async (job: Job) => {
      const {
        channel,
        receiver,
        message,
        description,
        model_type,
        reference,
        fcmTokens,
      } = job.data
      console.log(`[Notification Worker] Processing job ${job.name}`)

      try {
        if (job.name === 'send-notification') {
          // 1. In-app + socket notification
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
            if (io && receiver) {
              const ver = 'notification::' + receiver
              io.emit(ver, {
                ...payload,
                createdAt: moment().format('YYYY-MM-DD'),
              })
            }
            console.log(
              `[Notification Worker] Socket notification saved for user ${receiver}`,
            )
          }

          // 2. Push notification via FCM token(s)
          if (channel === 'push' || channel === 'both') {
            const tokens = Array.isArray(fcmTokens)
              ? fcmTokens.filter(Boolean)
              : []

            if (tokens.length > 0) {
              try {
                const response = await getMessaging().sendEachForMulticast({
                  tokens,
                  notification: {
                    title: message,
                    body: description || message,
                  },
                  data: {
                    type: model_type || 'General',
                    receiver: receiver ? String(receiver) : '',
                    reference: reference ? String(reference) : '',
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

                console.log(
                  `[Notification Worker] FCM push success=${response.successCount} failure=${response.failureCount} for user ${receiver}`,
                )
              } catch (firebaseError) {
                console.warn(
                  `[Notification Worker] Firebase FCM send failed:`,
                  firebaseError,
                )
              }
            } else {
              console.log(
                `[Notification Worker] No FCM token for user ${receiver}, push skipped`,
              )
            }
          }
        }
      } catch (error) {
        console.error(
          `[Notification Worker] Job ${job.id} failed processing:`,
          error,
        )
        throw error
      }
    },
    {
      connection: connection as any,
    },
  )

  worker.on('failed', (job, err) => {
    console.error(`[Notification Worker] Job ${job?.id} failed:`, err)
  })

  console.log('[Notification Worker] Notification worker initialized')
  return worker
}
