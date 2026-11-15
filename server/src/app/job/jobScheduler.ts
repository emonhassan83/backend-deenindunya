import cron from 'node-cron'
import { generateIslamicEventsForYear } from './generateIslamicEvents.job'
import { schedulePrayerNotifications } from './schedulePrayerNotifications.job'

export const startJobScheduler = () => {
  cron.schedule('0 0 1 1 *', async () => {
    const nextYear = new Date().getFullYear() + 1
    await generateIslamicEventsForYear(nextYear)
    console.log(`Generated Islamic events for year ${nextYear}`)
  })

  // Fire prayer FCM pushes for users whose notifyAt matches the current minute.
  cron.schedule('* * * * *', async () => {
    try {
      await schedulePrayerNotifications()
    } catch (error) {
      console.error('[Prayer Notify] Scheduler failed:', error)
    }
  })
}
