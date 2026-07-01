import { Worker, Job } from 'bullmq'
import { getRedisClient } from '../../config/redis.config'

export const initializeSystemWorker = () => {
  const connection = getRedisClient()

  const worker = new Worker(
    'system-queue',
    async (job: Job) => {
      console.log(`[System Worker] Processing job ${job.name} (id: ${job.id})`)
      if (job.name === 'system-cleanup') {
        console.log('[System Worker] Running system cleanup tasks...')
      } else {
        console.log(`[System Worker] Job type ${job.name} not implemented, data:`, job.data)
      }
    },
    {
      connection: connection as any,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[System Worker] Job ${job?.id} failed:`, err)
  })

  console.log('[System Worker] System worker initialized')
  return worker
}
