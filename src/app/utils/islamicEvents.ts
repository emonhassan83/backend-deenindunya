// seeders/islamicEvents.seeder.ts
import moment from 'moment-hijri'
import { ISLAMIC_EVENTS } from '../modules/event/event.utils'
import { Event } from '../modules/event/event.models'
import { EVENT_TYPE } from '../modules/event/event.constants'

// ✅ Always use English locale globally
moment.locale('en')

// ✅ Convert Arabic/Persian digits to English
const toEnglishDigits = (str: string): string => {
  if (!str) return str
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  let result = str
  arabicDigits.forEach((d, i) => (result = result.replace(new RegExp(d, 'g'), i.toString())))
  persianDigits.forEach((d, i) => (result = result.replace(new RegExp(d, 'g'), i.toString())))
  return result
}

// ✅ FIXED: Correct Hijri → Gregorian conversion
const getGregorianDate = (hijriYear: number, hijriMonth: number, hijriDay: number): string => {
  // 🔒 Validate inputs are actually Hijri values
  // Current Hijri year is ~1446-1447. Valid range: 1400–1500
  if (hijriYear < 1400 || hijriYear > 1600) {
    throw new Error(
      `Invalid Hijri year: ${hijriYear}. ` +
      `Expected Hijri year (e.g., 1446). ` +
      `Did you accidentally pass a Gregorian year?`
    )
  }
  if (hijriMonth < 1 || hijriMonth > 12) {
    throw new Error(`Invalid Hijri month: ${hijriMonth}. Must be 1–12.`)
  }
  if (hijriDay < 1 || hijriDay > 30) {
    throw new Error(`Invalid Hijri day: ${hijriDay}. Must be 1–30.`)
  }

  moment.locale('en')

  // ✅ Use iYear, iMonth (0-indexed), iDate setters — most reliable method
  const hijriDate = moment()
    .iYear(hijriYear)
    .iMonth(hijriMonth - 1)   // moment-hijri months are 0-indexed
    .iDate(hijriDay)
    .startOf('iDate')          // normalize time

  if (!hijriDate.isValid()) {
    throw new Error(`Invalid Hijri date: ${hijriYear}-${hijriMonth}-${hijriDay}`)
  }

  let gregorianDate = hijriDate.format('YYYY-MM-DD')
  gregorianDate = toEnglishDigits(gregorianDate)

  // Final validation: must be YYYY-MM-DD with real digits
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gregorianDate)) {
    throw new Error(`Date format error: ${gregorianDate}`)
  }

  // Sanity check: result should be a modern date (2020–2050 range)
  const resultYear = parseInt(gregorianDate.split('-')[0])
  if (resultYear < 2000 || resultYear > 2100) {
    throw new Error(
      `Gregorian conversion seems wrong: ${gregorianDate}. ` +
      `Hijri input was: ${hijriYear}-${hijriMonth}-${hijriDay}`
    )
  }

  return gregorianDate
}

// ✅ FIXED: Always use iYear() — NOT year()
const getCurrentHijriYear = (): number => {
  moment.locale('en')
  const hijriYear = moment().iYear()

  // Extra safety check
  if (hijriYear < 1400 || hijriYear > 1600) {
    throw new Error(`moment().iYear() returned suspicious value: ${hijriYear}. Check moment-hijri installation.`)
  }

  return hijriYear
}

// ─────────────────────────────────────────────
// Core seeder functions
// ─────────────────────────────────────────────

const generateIslamicEventsForYear = async (hijriYear: number) => {
  const created = []
  const skipped = []
  const errors = []

  // Validate hijri year before doing anything
  if (hijriYear < 1400 || hijriYear > 1600) {
    throw new Error(
      `generateIslamicEventsForYear received invalid year: ${hijriYear}. ` +
      `Pass a Hijri year like 1446 or 1447, not a Gregorian year.`
    )
  }

  console.log(`\n🕌 Generating Islamic events for Hijri year ${hijriYear}...`)

  for (const event of ISLAMIC_EVENTS) {
    try {
      const gregorianDate = getGregorianDate(hijriYear, event.hijriMonth, event.hijriDay)

      // ✅ upsert: already exists → skip, না থাকলে → create
      // $setOnInsert শুধু নতুন document create হলেই run হয়
      // new:false → existing doc return করে, insert হলে null return করে
      const existing = await Event.findOneAndUpdate(
        {
          type: EVENT_TYPE.islamic,
          title: event.title,
          date: gregorianDate,
        },
        {
          $setOnInsert: {
            type: EVENT_TYPE.islamic,
            title: event.title,
            description: event.description,
            date: gregorianDate,
            user: null,
          },
        },
        { upsert: true, new: false }
      )

      if (existing === null) {
        created.push({ title: event.title, date: gregorianDate })
        console.log(`  ✅ Created : ${event.title} → ${gregorianDate}`)
      } else {
        skipped.push({ title: event.title, date: gregorianDate })
        console.log(`  ⏭️  Skipped : ${event.title} → ${gregorianDate} (already exists)`)
      }
    } catch (err: any) {
      // MongoDB duplicate key error (11000) — index level এ block
      if (err.code === 11000) {
        skipped.push({ title: event.title, date: 'duplicate-key' })
        console.log(`  ⏭️  Skipped : ${event.title} (duplicate key)`)
      } else {
        errors.push({ event: event.title, hijriDate: `${hijriYear}-${event.hijriMonth}-${event.hijriDay}`, error: err.message })
        console.error(`  ❌ Failed  : ${event.title} — ${err.message}`)
      }
    }
  }

  console.log(`\n📊 Hijri ${hijriYear} → ✅ ${created.length} created | ⏭️ ${skipped.length} skipped | ❌ ${errors.length} errors`)

  return {
    hijriYear,
    created: created.length,
    skipped: skipped.length,
    errors: errors.length,
    createdEvents: created,
    skippedEvents: skipped,
    errorDetails: errors,
  }
}

const generateIslamicEventsForYears = async (startHijriYear: number, endHijriYear: number) => {
  console.log(`\n🚀 Generating Islamic events for Hijri years ${startHijriYear} → ${endHijriYear}`)

  const results = []

  for (let year = startHijriYear; year <= endHijriYear; year++) {
    const result = await generateIslamicEventsForYear(year)
    results.push(result)
    await new Promise((r) => setTimeout(r, 100)) // small delay
  }

  const totalCreated = results.reduce((s, r) => s + r.created, 0)
  const totalSkipped = results.reduce((s, r) => s + r.skipped, 0)
  const totalErrors  = results.reduce((s, r) => s + r.errors, 0)

  console.log(`\n🎉 Done! ${totalCreated} created | ${totalSkipped} skipped | ${totalErrors} errors across ${results.length} years`)

  return results
}

// ✅ FIXED: Uses iYear() correctly
const generateCurrentAndFutureEvents = async (yearsAhead = 5) => {
  const currentHijriYear = getCurrentHijriYear()
  const endYear = currentHijriYear + yearsAhead

  console.log(`\n📅 Current Hijri year: ${currentHijriYear}`)
  console.log(`🚀 Generating events from ${currentHijriYear} to ${endYear}...`)

  return generateIslamicEventsForYears(currentHijriYear, endYear)
}

const seedMissingEventsForYear = async (hijriYear: number) => {
  const created = []
  const errors = []

  console.log(`\n🔍 Checking missing events for Hijri year ${hijriYear}...`)

  for (const event of ISLAMIC_EVENTS) {
    try {
      const gregorianDate = getGregorianDate(hijriYear, event.hijriMonth, event.hijriDay)

      const existing = await Event.findOneAndUpdate(
        { type: EVENT_TYPE.islamic, title: event.title, date: gregorianDate },
        {
          $setOnInsert: {
            type: EVENT_TYPE.islamic,
            title: event.title,
            description: event.description,
            date: gregorianDate,
            user: null,
          },
        },
        { upsert: true, new: false }
      ) as any

      if (existing === null) {
        created.push({ title: event.title, date: gregorianDate })
        console.log(`  ✅ Added missing: ${event.title} → ${gregorianDate}`)
      }
    } catch (err: any) {
      if (err.code !== 11000) {
        errors.push({ event: event.title, error: err.message })
      }
    }
  }

  console.log(`\n📊 ${created.length} missing events added | ${errors.length} errors`)
  return { hijriYear, added: created.length, errors: errors.length }
}

const deleteEventsByGregorianYear = async (gregorianYear: number) => {
  const result = await Event.deleteMany({
    type: EVENT_TYPE.islamic,
    date: { $regex: `^${gregorianYear}` },
  })
  console.log(`🗑️ Deleted ${result.deletedCount} events for Gregorian year ${gregorianYear}`)
  return result
}

const deleteEventsByHijriYear = async (hijriYear: number) => {
  // Each Hijri year spans two Gregorian years
  const g1 = hijriYear - 579  // approximate: hijri 1447 ≈ greg 2025-2026
  const g2 = g1 + 1

  const result = await Event.deleteMany({
    type: EVENT_TYPE.islamic,
    $or: [
      { date: { $regex: `^${g1}` } },
      { date: { $regex: `^${g2}` } },
    ],
  })
  console.log(`🗑️ Deleted ${result.deletedCount} events for Hijri year ${hijriYear}`)
  return result
}

const regenerateEventsForYear = async (hijriYear: number) => {
  console.log(`\n🔄 Regenerating events for Hijri year ${hijriYear}...`)
  await deleteEventsByHijriYear(hijriYear)
  return generateIslamicEventsForYear(hijriYear)
}

const fixExistingWrongDates = async () => {
  console.log('\n🔧 Fixing events with wrong date format...')

  const events = await Event.find({ type: EVENT_TYPE.islamic })
  let fixedCount = 0

  for (const event of events) {
    let needsUpdate = false
    let correctedDate = event.date

    if (/[٠-٩۰-۹]/.test(event.date)) {
      correctedDate = toEnglishDigits(event.date)
      needsUpdate = true
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(correctedDate)) {
      const parsed = new Date(correctedDate)
      if (!isNaN(parsed.getTime())) {
        correctedDate = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
        needsUpdate = true
      }
    }

    if (needsUpdate && correctedDate !== event.date) {
      await Event.findByIdAndUpdate(event._id, { date: correctedDate })
      console.log(`  ✅ Fixed: "${event.title}" ${event.date} → ${correctedDate}`)
      fixedCount++
    }
  }

  console.log(`\n📊 Fixed ${fixedCount} events`)
  return { fixedCount }
}

const getIslamicEventsStats = async () => {
  const totalEvents = await Event.countDocuments({ type: EVENT_TYPE.islamic })

  const eventsByYear = await Event.aggregate([
    { $match: { type: EVENT_TYPE.islamic } },
    { $group: { _id: { $substr: ['$date', 0, 4] }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])

  const eventsByTitle = await Event.aggregate([
    { $match: { type: EVENT_TYPE.islamic } },
    { $group: { _id: '$title', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])

  return { totalEvents, eventsByYear, eventsByTitle }
}

export const IslamicEventSeeder = {
  generateIslamicEventsForYear,
  generateIslamicEventsForYears,
  generateCurrentAndFutureEvents,
  seedMissingEventsForYear,
  deleteEventsByGregorianYear,
  deleteEventsByHijriYear,
  regenerateEventsForYear,
  fixExistingWrongDates,
  getIslamicEventsStats,
  toEnglishDigits,
  getCurrentHijriYear,  // ✅ exported for debugging
}