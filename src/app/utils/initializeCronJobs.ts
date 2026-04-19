// cron/taskCleanup.cron.ts
import cron from 'node-cron'
import moment from 'moment-timezone'
import { Task } from '../modules/task/task.models'

// Get all unique user timezones and delete expired tasks
export const cleanupExpiredTasks = async () => {
  try {
    console.log('Running task cleanup cron job...')
    
    // Get all distinct user timezones
    const timezones = await Task.distinct('userTimeZone', {
      isCompleted: { $ne: true } // Only delete incomplete tasks
    })
    
    const now = new Date()
    let totalDeleted = 0
    
    for (const timezone of timezones) {
      // Current time in user's timezone
      const nowInUserTZ = moment.tz(timezone)
      const currentDateInUserTZ = nowInUserTZ.format('YYYY-MM-DD')
      
      // Tasks that should be deleted (expiryDate <= now)
      const result = await Task.deleteMany({
        userTimeZone: timezone,
        expiryDate: { $lte: now },
        isCompleted: false
      })
      
      totalDeleted += result.deletedCount || 0
    }
    
    console.log(`Deleted ${totalDeleted} expired tasks`)
  } catch (error) {
    console.error('Task cleanup cron job failed:', error)
  }
}

// Schedule cron job to run every hour (or at midnight)
// Runs at 00:00 (midnight) every day
cron.schedule('0 0 * * *', cleanupExpiredTasks)
