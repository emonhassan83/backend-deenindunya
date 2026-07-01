import mongoose from 'mongoose'
import config from '../config'
import { Mood } from '../modules/moods/moods.model'

const defaultMoods = [
  { title: 'Happy', emoji: '😊' },
  { title: 'Sad', emoji: '😢' },
  { title: 'Excited', emoji: '🎉' },
  { title: 'Angry', emoji: '😠' },
  { title: 'Calm', emoji: '😌' },
  { title: 'Anxious', emoji: '😰' },
  { title: 'Grateful', emoji: '🙏' },
  { title: 'Tired', emoji: '😴' },
  { title: 'Loved', emoji: '🥰' },
  { title: 'Hopeful', emoji: '🌟' },
]

const seedMoods = async () => {
  try {
    console.log('📦 Connecting to database...')
    await mongoose.connect(config.database_url as string)
    console.log('✅ Database connected successfully!\n')

    const existingMoods = await Mood.find({}, { title: 1 }).lean()
    const existingTitles = new Set(existingMoods.map((m) => m.title))

    const moodsToInsert = defaultMoods.filter(
      (mood) => !existingTitles.has(mood.title),
    )

    if (moodsToInsert.length > 0) {
      await Mood.insertMany(moodsToInsert)
      console.log(`✅ ${moodsToInsert.length} new mood(s) seeded successfully!`)
    } else {
      console.log('⚠️ All default moods already exist – nothing to seed.')
    }

    await mongoose.disconnect()
    console.log('\n🔌 Database connection closed.')
  } catch (error) {
    console.error('❌ Error seeding moods:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedMoods()
