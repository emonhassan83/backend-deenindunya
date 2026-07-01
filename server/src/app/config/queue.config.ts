import { QueueOptions } from 'bullmq'
import { getRedisClient } from './redis.config'

export function createQueueOptions(): QueueOptions {
  return {
    connection: getRedisClient() as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }
}
