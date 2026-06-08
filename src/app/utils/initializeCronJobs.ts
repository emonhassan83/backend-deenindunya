import cron from 'node-cron'
import moment from 'moment-timezone'
import { ISLAMIC_EVENTS } from '../modules/event/event.utils'
import { Event } from '../modules/event/event.models'
import { EVENT_TYPE } from '../modules/event/event.constants'

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
        user: null as any
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