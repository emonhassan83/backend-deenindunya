import moment from 'moment-timezone'
import { EVENT_TYPE } from '../modules/event/event.constants'
import { Event } from '../modules/event/event.models'
import { ISLAMIC_EVENTS } from '../modules/event/event.utils'

export const generateIslamicEventsForYear = async (year: number) => {
  const createdEvents = []

  for (const event of ISLAMIC_EVENTS) {
    const hijriDate = moment(
      `${year}-${event.hijriMonth}-${event.hijriDay}`,
      'iYYYY-iM-iD',
    )
    const gregorianDate = hijriDate.format('YYYY-MM-DD')

    const exists = await Event.findOne({
      type: EVENT_TYPE.islamic,
      title: event.title,
      date: gregorianDate,
    })

    if (!exists) {
      const newEvent = await Event.create({
        type: EVENT_TYPE.islamic,
        title: event.title,
        description: event.description,
        date: gregorianDate,
        user: null as any,
      })
      createdEvents.push(newEvent)
    }
  }

  return createdEvents
}
