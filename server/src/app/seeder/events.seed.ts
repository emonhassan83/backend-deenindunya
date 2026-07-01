// src/app/seeder/events.seed.ts
import mongoose from 'mongoose'
import { IslamicEventSeeder } from '../utils/islamicEvents'
import { Event } from '../modules/event/event.models'
import config from '../config'
import { logger } from '../utils/logger'

const runSeeder = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.database_url as string)
    logger.info('📦 Connected to database')

    // Parse command line arguments
    const args = process.argv.slice(2)
    let command = args[0]
    let param1 = args[1]
    let param2: string | undefined = args[2]

    // ✅ If no command provided, default to --current
    if (!command) {
      console.log('ℹ️ No command provided. Defaulting to --current...')
      command = '--current'
    }

    // Handle --all as a flag
    if (command === '--delete' && param1 === '--all') {
      param1 = '--all'
      param2 = undefined
    }

    console.log('\n' + '='.repeat(60))
    console.log('🕌 ISLAMIC EVENTS SEEDER')
    console.log('='.repeat(60) + '\n')

    switch (command) {
      case '--current':
        console.log('📅 Seeding current and future events...')
        await IslamicEventSeeder.generateCurrentAndFutureEvents(5)
        break

      case '--year':
        if (!param1) {
          console.error('❌ Please provide a Hijri year (e.g., --year 1446)')
          console.log('\n💡 Example: npm run seed:events:year 1446')
          process.exit(1)
        }
        const hijriYear = parseInt(param1)
        if (isNaN(hijriYear)) {
          console.error('❌ Invalid year format. Please provide a number.')
          process.exit(1)
        }
        console.log(`📅 Seeding Hijri year ${hijriYear}...`)
        await IslamicEventSeeder.generateIslamicEventsForYear(hijriYear)
        break

      case '--range':
        if (!param1 || !param2) {
          console.error('❌ Please provide start and end years (e.g., --range 1440 1450)')
          console.log('\n💡 Example: npm run seed:events:range 1440 1450')
          process.exit(1)
        }
        const startYear = parseInt(param1)
        const endYear = parseInt(param2)
        if (isNaN(startYear) || isNaN(endYear)) {
          console.error('❌ Invalid year format. Please provide numbers.')
          process.exit(1)
        }
        console.log(`📅 Seeding Hijri years ${startYear} to ${endYear}...`)
        await IslamicEventSeeder.generateIslamicEventsForYears(startYear, endYear)
        break

      case '--fix':
        console.log('🔧 Fixing wrong dates in existing events...')
        await IslamicEventSeeder.fixExistingWrongDates()
        break

      case '--stats':
        console.log('📊 Islamic Events Statistics...')
        const stats = await IslamicEventSeeder.getIslamicEventsStats()
        console.log('\n📈 STATISTICS:')
        console.log(`   Total Events: ${stats.totalEvents}`)
        console.log('\n   Events by Year:')
        stats.eventsByYear.forEach((item: any) => {
          console.log(`     ${item._id}: ${item.count} events`)
        })
        console.log('\n   Events by Title:')
        stats.eventsByTitle.forEach((item: any) => {
          console.log(`     ${item._id}: ${item.count} times`)
        })
        break

      case '--delete':
        if (param1 === '--all') {
          console.log('🗑️ Deleting ALL Islamic events...')
          const result = await Event.deleteMany({ type: 'islamic' })
          console.log(`   ✅ Deleted ${result.deletedCount} events`)
        } else if (param1) {
          const year = parseInt(param1)
          if (isNaN(year)) {
            console.error('❌ Invalid year format. Please provide a valid year.')
            console.log('\n💡 Examples:')
            console.log('   npm run seed:events:delete')
            console.log('   npm run seed:events:delete-all')
            process.exit(1)
          }
          console.log(`🗑️ Deleting events for Gregorian year ${year}...`)
          await IslamicEventSeeder.deleteEventsByGregorianYear(year)
        } else {
          console.error('❌ Please specify a year or --all flag')
          console.log('\n💡 Examples:')
          console.log('   npm run seed:events:delete')
          console.log('   npm run seed:events:delete-all')
          process.exit(1)
        }
        break

      case '--regenerate':
        if (!param1) {
          console.error('❌ Please provide a Hijri year (e.g., --regenerate 1446)')
          console.log('\n💡 Example: npm run seed:events:regenerate 1446')
          process.exit(1)
        }
        const regYear = parseInt(param1)
        if (isNaN(regYear)) {
          console.error('❌ Invalid year format. Please provide a number.')
          process.exit(1)
        }
        console.log(`🔄 Regenerating events for Hijri year ${regYear}...`)
        await IslamicEventSeeder.regenerateEventsForYear(regYear)
        break

      case '--missing':
        if (!param1) {
          console.error('❌ Please provide a Hijri year (e.g., --missing 1446)')
          console.log('\n💡 Example: npm run seed:events:missing 1446')
          process.exit(1)
        }
        const missYear = parseInt(param1)
        if (isNaN(missYear)) {
          console.error('❌ Invalid year format. Please provide a number.')
          process.exit(1)
        }
        console.log(`🔍 Seeding missing events for Hijri year ${missYear}...`)
        await IslamicEventSeeder.seedMissingEventsForYear(missYear)
        break

      case '--help':
      case '-h':
        console.log(`
📖 ISLAMIC EVENTS SEEDER - USAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  npm run seed:events
     Default: Seed current Hijri year + next 5 years

  npm run seed:events:current
     Seed current Hijri year + next 5 years

  npm run seed:events:year 1446
     Seed a specific Hijri year

  npm run seed:events:range 1440 1450
     Seed a range of Hijri years

  npm run seed:events:fix
     Fix existing wrong dates in database

  npm run seed:events:stats
     Show statistics of Islamic events

  npm run seed:events:delete
     Delete events for Gregorian year 2024

  npm run seed:events:delete-all
     Delete ALL Islamic events

  npm run seed:events:regenerate 1446
     Delete and regenerate events for a Hijri year

  npm run seed:events:missing 1446
     Seed only missing events for a Hijri year

  npm run seed:events:help
     Show this help message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `)
        break

      default:
        console.log(`
❌ Unknown command: ${command}

Run with --help to see available commands.

Examples:
  npm run seed:events
  npm run seed:events:current
  npm run seed:events:year 1446
  npm run seed:events:stats
  npm run seed:events:delete
        `)
        break
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Seeder completed successfully!')
    console.log('='.repeat(60) + '\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seeder failed:', error)
    logger.error('Seeder failed:', error)
    process.exit(1)
  }
}

runSeeder()