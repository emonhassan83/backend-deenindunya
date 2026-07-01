import { Worker, Job } from 'bullmq'
import { getRedisClient } from '../../config/redis.config'
import emailSender from '../../utils/emailSender'
import { getOtpEmailTemplate } from '../templates/otp-email.template'

export const initializeEmailWorker = () => {
  const connection = getRedisClient()

  const worker = new Worker(
    'email-queue',
    async (job: Job) => {
      if (job.name === 'send-verification-email') {
        const { email, name, otp, expiresAt } = job.data
        console.log(`[Email Worker] Processing send-verification-email for ${email}`)

        try {
          const html = getOtpEmailTemplate(name, otp, expiresAt)
          await emailSender(email, 'Your One-Time OTP', html)
          console.log(`[Email Worker] Successfully sent OTP email to ${email}`)
        } catch (error) {
          console.error(`[Email Worker] Error sending OTP email to ${email}:`, error)
          throw error
        }
      }
    },
    {
      connection: connection as any,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[Email Worker] Job ${job?.id} failed:`, err)
  })

  console.log('[Email Worker] Email worker initialized')
  return worker
}
