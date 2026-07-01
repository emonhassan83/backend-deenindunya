import mongoose from 'mongoose'
import config from '../config'
import { Contents } from '../modules/contents/contents.models'

const seedContents = async () => {
  try {
    console.log('📦 Connecting to database...')
    await mongoose.connect(config.database_url as string)
    console.log('✅ Database connected successfully!\n')

    const defaults = [
      { key: 'termsAndConditions', value: '' },
      { key: 'privacyPolicy', value: '' },
      {
        key: 'waterIntake',
        value: [
          '250ml',
          '500ml',
          '1000ml',
          '1500ml',
          '2000ml',
          '2500ml',
          '3000ml',
        ],
      },
    ]

    for (const item of defaults) {
      const exists = await Contents.findOne({ key: item.key })
      if (!exists) {
        await Contents.create(item)
        console.log(`✅ Default Content "${item.key}" seeded successfully!`)
      } else {
        console.log(`⚠️ Default Content "${item.key}" already exists – skipping.`)
      }
    }

    await mongoose.disconnect()
    console.log('\n🔌 Database connection closed.')
  } catch (error) {
    console.error('❌ Error seeding contents:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedContents()
