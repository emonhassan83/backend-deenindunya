import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'
import moment from 'moment-timezone'
import momentHijri from 'moment-hijri'

export const DEFAULT_PRAYER_TIMEZONE = 'Asia/Dhaka'

export const resolvePrayerTimezone = (timezone?: string | null) =>
  timezone && moment.tz.zone(timezone) ? timezone : DEFAULT_PRAYER_TIMEZONE

// moment-hijri switches the global moment locale to Arabic, so every instance pins 'en'.
export const getTodayInTimezone = (timezone?: string | null) =>
  moment()
    .tz(resolvePrayerTimezone(timezone))
    .locale('en')
    .format('YYYY-MM-DD')

// Matches Aladhan `method: 2` (ISNA, Fajr/Isha 15°, Shafi Asr).
export const calculatePrayerTimes = ({
  latitude,
  longitude,
  date,
  timezone,
}: {
  latitude: number
  longitude: number
  date: string // YYYY-MM-DD
  timezone?: string | null
}) => {
  const tz = resolvePrayerTimezone(timezone)
  const [year, month, day] = date.split('-').map(Number)

  // adhan reads the local year/month/day components of this Date.
  const times = new PrayerTimes(
    new Coordinates(latitude, longitude),
    new Date(year, month - 1, day),
    CalculationMethod.NorthAmerica(),
  )

  const format = (value: Date) =>
    moment(value).tz(tz).locale('en').format('HH:mm')
  const gregorian = moment.tz(date, 'YYYY-MM-DD', tz).locale('en')

  return {
    fajr: format(times.fajr),
    sunrise: format(times.sunrise),
    dhuhr: format(times.dhuhr),
    asr: format(times.asr),
    maghrib: format(times.maghrib),
    isha: format(times.isha),
    date: {
      readable: gregorian.format('DD MMM YYYY'),
      gregorian: gregorian.format('DD-MM-YYYY'),
      hijri: momentHijri(date, 'YYYY-MM-DD')
        .locale('en')
        .format('iDD-iMM-iYYYY'),
    },
  }
}
