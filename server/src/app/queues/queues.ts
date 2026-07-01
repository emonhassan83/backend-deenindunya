import { Queue } from 'bullmq'
import { createQueueOptions } from '../config/queue.config'

let _emailQueue: Queue | null = null
let _notificationQueue: Queue | null = null
let _systemQueue: Queue | null = null

export const getEmailQueue = () => {
  if (!_emailQueue) {
    _emailQueue = new Queue('email-queue', createQueueOptions())
  }
  return _emailQueue
}

export const getNotificationQueue = () => {
  if (!_notificationQueue) {
    _notificationQueue = new Queue('notification-queue', createQueueOptions())
  }
  return _notificationQueue
}

export const getSystemQueue = () => {
  if (!_systemQueue) {
    _systemQueue = new Queue('system-queue', createQueueOptions())
  }
  return _systemQueue
}
