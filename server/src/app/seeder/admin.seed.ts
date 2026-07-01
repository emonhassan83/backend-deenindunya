import mongoose from 'mongoose'
import config from '../config'
import { USER_ROLE } from '../modules/user/user.constant'
import { User } from '../modules/user/user.model'

const adminUser = {
  name: 'deenindunya',
  email: 'admin@deenindunya.gmail.com',
  password: config.admin_pass,
  role: USER_ROLE.admin,
  verification: {
    otp: '0',
    status: true,
  },
  expireAt: null as any,
}

const seedAdmin = async () => {
  try {
    console.log('📦 Connecting to database...')
    await mongoose.connect(config.database_url as string)
    console.log('✅ Database connected successfully!\n')

    const isAdminExits = await User.findOne({ role: USER_ROLE.admin })

    if (!isAdminExits) {
      await User.create(adminUser)
      console.log('\n✅ Admin User Seeded Successfully!')
    } else {
      console.log('\n⚠️ Admin User already exists – skipping seed.')
    }

    await mongoose.disconnect()
    console.log('\n🔌 Database connection closed.')
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedAdmin()
