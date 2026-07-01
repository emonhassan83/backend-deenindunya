import config from '../config'
import { Contents } from '../modules/contents/contents.models'
import { Mood } from '../modules/moods/moods.model'
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

// Mood Seeder
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
];

const seedMoods = async () => {
  try {
    // Get existing mood titles (case-insensitive? We'll assume exact match)
    const existingMoods = await Mood.find({}, { title: 1 }).lean();
    const existingTitles = new Set(existingMoods.map(m => m.title));

    // Filter out moods that already exist
    const moodsToInsert = defaultMoods.filter(mood => !existingTitles.has(mood.title));

    if (moodsToInsert.length > 0) {
      await Mood.insertMany(moodsToInsert);
      console.log(`\n✅ ${moodsToInsert.length} new mood(s) seeded successfully!`);
    } else {
      console.log('\n⚠️ All default moods already exist – nothing to seed.');
    }
  } catch (error) {
    console.error('❌ Error seeding moods:', error);
  }
};

export const seeder = {
  seedContents,
  seedAdmin,
  seedMoods
}
