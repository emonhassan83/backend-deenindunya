import config from '../config'
import { Contents } from '../modules/contents/contents.models'
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
  expireAt: null,
}

// Function to seed admin
const seedAdmin = async () => {
  //when database is connected, we will check is there any user who is admin
  const isAdminExits = await User.findOne({ role: USER_ROLE.admin })

  if (!isAdminExits) {
    await User.create(adminUser)
    console.log('\n✅ Admin User Seeded Successfully!')
  }
}

// Function to seed Contents
const seedContents = async () => {
  const existingContents = await Contents.countDocuments()

  if (existingContents === 0) {
    await Contents.create({
      termsAndConditions: '',
      privacyPolicy: '',
      waterIntake: [
        '250ml',
        '500ml',
        '1000ml',
        '1500ml',
        '2000ml',
        '2500ml',
        '3000ml',
      ],
    })

    console.log('\n✅Default Contents seeded successfully!')
  }
}

export const seeder = {
  seedContents,
  seedAdmin,
}
