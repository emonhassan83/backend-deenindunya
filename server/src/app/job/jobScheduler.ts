import cron from 'node-cron'
import { generateIslamicEventsForYear } from './generateIslamicEvents.job'

export const startJobScheduler = () => {
  cron.schedule('0 0 1 1 *', async () => {
    const nextYear = new Date().getFullYear() + 1
    await generateIslamicEventsForYear(nextYear)
    console.log(`Generated Islamic events for year ${nextYear}`)
  })
}
