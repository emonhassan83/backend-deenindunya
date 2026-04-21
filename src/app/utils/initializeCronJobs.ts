import cron from 'node-cron'
import moment from 'moment-timezone'
import { Task } from '../modules/task/task.models'
import { ISLAMIC_EVENTS } from '../modules/event/event.utils'
import { Event } from '../modules/event/event.models'
import { EVENT_TYPE } from '../modules/event/event.constants'

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

// Generate Islamic events for a specific year
const generateIslamicEventsForYear = async (year: number) => {
  const createdEvents = []
  
  for (const event of ISLAMIC_EVENTS) {
    // Convert Hijri to Gregorian
    const hijriDate = moment(`${year}-${event.hijriMonth}-${event.hijriDay}`, 'iYYYY-iM-iD')
    const gregorianDate = hijriDate.format('YYYY-MM-DD')
    
    // Check if already exists
    const exists = await Event.findOne({
      type: EVENT_TYPE.islamic,
      title: event.title,
      date: gregorianDate
    })
    
    if (!exists) {
      const newEvent = await Event.create({
        type: EVENT_TYPE.islamic,
        title: event.title,
        description: event.description,
        date: gregorianDate,
        user: null
      })
      createdEvents.push(newEvent)
    }
  }
  
  return createdEvents
}

// Cron job: Run every year on January 1st
cron.schedule('0 0 1 1 *', async () => {
  const nextYear = new Date().getFullYear() + 1
  await generateIslamicEventsForYear(nextYear)
  console.log(`Generated Islamic events for year ${nextYear}`)
})