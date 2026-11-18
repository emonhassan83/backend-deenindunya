import mongoose from 'mongoose'
import config from '../config'
import { Sunnah, SunnahLog } from '../modules/sunnah/sunnah.models'
import { TSunnah } from '../modules/sunnah/sunnah.interface'

const sunnahsData: Omit<TSunnah, '_id'>[] = [
  // 1. Morning & Evening Sunnahs
  {
    category: 'Morning & Evening Sunnahs',
    title: 'Dua Upon Waking Up',
    subtitle: 'Praising Allah for granting life after sleep when waking up in the morning.',
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    isDeleted: false,
  },
  {
    category: 'Morning & Evening Sunnahs',
    title: 'Morning Remembrance (Adhkar)',
    subtitle: 'Entering the morning in the remembrance and protection of Allah.',
    arabicText: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    isDeleted: false,
  },
  {
    category: 'Morning & Evening Sunnahs',
    title: 'Evening Remembrance (Adhkar)',
    subtitle: 'Entering the evening seeking Allah’s protection and blessings.',
    arabicText: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    isDeleted: false,
  },

  // 2. Eating & Drinking Sunnahs
  {
    category: 'Eating & Drinking Sunnahs',
    title: 'Saying Bismillah Before Eating',
    subtitle: 'Mentioning the name of Allah and eating with the right hand from what is nearest.',
    arabicText: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    isDeleted: false,
  },
  {
    category: 'Eating & Drinking Sunnahs',
    title: 'Dua After Eating',
    subtitle: 'Thanking Allah for providing food and sustenance without our own might or power.',
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    isDeleted: false,
  },
  {
    category: 'Eating & Drinking Sunnahs',
    title: 'Drinking Water in Three Sips Sitting Down',
    subtitle: 'Drinking with the right hand while sitting, taking three breaths, and praising Allah after finishing.',
    arabicText: 'بِسْمِ اللَّهِ ... الْحَمْدُ لِلَّهِ',
    isDeleted: false,
  },

  // 3. Personal Hygiene & Cleanliness
  {
    category: 'Personal Hygiene & Cleanliness',
    title: 'Using the Miswak (Toothstick)',
    subtitle: 'Purifying the mouth and pleasing the Lord, especially upon waking and before prayer.',
    arabicText: 'السِّوَاكُ مَطْهَرَةٌ لِلْفَمِ مَرْضَاةٌ لِلرَّبِّ',
    isDeleted: false,
  },
  {
    category: 'Personal Hygiene & Cleanliness',
    title: 'Maintaining Purity and Cleanliness',
    subtitle: 'Keeping the body, garments, and surroundings clean and pure as part of faith.',
    arabicText: 'الطُّهُورُ شَطْرُ الْإِيمَانِ',
    isDeleted: false,
  },
  {
    category: 'Personal Hygiene & Cleanliness',
    title: 'Practising the Acts of Fitrah (Grooming)',
    subtitle: 'Trimming nails, maintaining neat hair, and observing personal hygiene regularly.',
    arabicText: 'الْفِطْرَةُ خَمْسٌ: الْخِتَانُ، وَالِاسْتِحْدَادُ، وَقَصُّ الشَّارِبِ، وَتَقْلِيمُ الْأَظْفَارِ، وَنَتْفُ الْإِبْطِ',
    isDeleted: false,
  },

  // 4. Prayer & Worship
  {
    category: 'Prayer & Worship',
    title: 'Praying the 12 Sunnah Rawatib Prayers',
    subtitle: 'Consistently performing the regular voluntary prayers before and after obligatory prayers.',
    arabicText: 'مَنْ صَلَّى اثْنَتَيْ عَشْرَةَ رَكْعَةً فِي يَوْمٍ وَلَيْلَةٍ بُنِيَ لَهُ بِهِنَّ بَيْتٌ فِي الْجَنَّةِ',
    isDeleted: false,
  },
  {
    category: 'Prayer & Worship',
    title: 'Reciting Ayat al-Kursi After Every Obligatory Prayer',
    subtitle: 'Reciting Ayat al-Kursi after each fard salah for Allah’s protection and reward of Paradise.',
    arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    isDeleted: false,
  },
  {
    category: 'Prayer & Worship',
    title: 'Tasbih After Obligatory Prayers',
    subtitle: 'Saying SubhanAllah (33x), Alhamdulillah (33x), and Allahu Akbar (34x) after fard prayers.',
    arabicText: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ',
    isDeleted: false,
  },

  // 5. Character & Good Manners
  {
    category: 'Character & Good Manners',
    title: 'Smiling at Others',
    subtitle: 'Meeting others with a warm and cheerful face as an act of charity.',
    arabicText: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    isDeleted: false,
  },
  {
    category: 'Character & Good Manners',
    title: 'Speaking Good or Remaining Silent',
    subtitle: 'Guarding the tongue by speaking gently, honestly, and beneficially.',
    arabicText: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    isDeleted: false,
  },
  {
    category: 'Character & Good Manners',
    title: 'Showing Kindness, Patience, and Gentleness',
    subtitle: 'Treating people with mercy, patience, and gentleness in all matters.',
    arabicText: 'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الْأَمْرِ كُلِّهِ',
    isDeleted: false,
  },

  // 6. Daily Life Sunnahs
  {
    category: 'Daily Life Sunnahs',
    title: 'Dua When Leaving the Home',
    subtitle: 'Placing trust in Allah when stepping out of the house for daily activities.',
    arabicText: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    isDeleted: false,
  },
  {
    category: 'Daily Life Sunnahs',
    title: 'Entering the Home with Bismillah and Salam',
    subtitle: 'Mentioning Allah’s name upon entering and greeting the household with peace.',
    arabicText: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    isDeleted: false,
  },
  {
    category: 'Daily Life Sunnahs',
    title: 'Spreading the Greeting of Salam & Starting with the Right',
    subtitle: 'Greeting others with As-Salamu Alaykum and beginning noble actions with the right side.',
    arabicText: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
    isDeleted: false,
  },

  // 7. Sleeping Sunnahs
  {
    category: 'Sleeping Sunnahs',
    title: 'Dua Before Sleeping',
    subtitle: 'Sleeping in a state of Wudu on the right side and remembering Allah before sleep.',
    arabicText: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    isDeleted: false,
  },
  {
    category: 'Sleeping Sunnahs',
    title: 'Reciting the Three Quls and Dusting the Bed',
    subtitle: 'Dusting the bed three times and reciting Surah Al-Ikhlas, Al-Falaq, and An-Nas into the palms.',
    arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    isDeleted: false,
  },
  {
    category: 'Sleeping Sunnahs',
    title: 'Tasbih Fatimi Before Sleep',
    subtitle: 'Reciting SubhanAllah (33x), Alhamdulillah (33x), and Allahu Akbar (34x) before going to sleep.',
    arabicText: 'سُبْحَانَ اللَّهِ (٣٣) وَالْحَمْدُ لِلَّهِ (٣٣) وَاللَّهُ أَكْبَرُ (٣٤)',
    isDeleted: false,
  },

  // 8. Friday Sunnahs
  {
    category: 'Friday Sunnahs',
    title: 'Reciting Surah Al-Kahf on Friday',
    subtitle: 'Reading Surah Al-Kahf on Jumu’ah for illumination and light between the two Fridays.',
    arabicText: 'مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ',
    isDeleted: false,
  },
  {
    category: 'Friday Sunnahs',
    title: 'Sending Abundant Salawat Upon the Prophet (ﷺ)',
    subtitle: 'Increasing blessings and salutations upon Prophet Muhammad (ﷺ) throughout Friday.',
    arabicText: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    isDeleted: false,
  },
  {
    category: 'Friday Sunnahs',
    title: 'Performing Ghusl and Going Early to Jumu’ah',
    subtitle: 'Bathing, wearing clean clothes, applying perfume, and arriving early for Jumu’ah prayer.',
    arabicText: 'غُسْلُ يَوْمِ الْجُمُعَةِ وَاجِبٌ عَلَى كُلِّ مُحْتَلِمٍ، وَأَنْ يَسْتَنَّ، وَأَنْ يَمَسَّ طِيبًا إِنْ وَجَدَ',
    isDeleted: false,
  },
]

const seedSunnahs = async () => {
  try {
    console.log('📦 Connecting to database...')
    await mongoose.connect(config.database_url as string)
    console.log('✅ Database connected successfully!\n')

    console.log('🗑️ Removing old Sunnah and SunnahLog data...')
    const deletedSunnahs = await Sunnah.deleteMany({})
    const deletedLogs = await SunnahLog.deleteMany({})
    console.log(
      `   Removed ${deletedSunnahs.deletedCount} old Sunnah(s) and ${deletedLogs.deletedCount} old SunnahLog(s).\n`,
    )

    console.log('🌱 Inserting new Sunnah data with categories...')
    const inserted = await Sunnah.insertMany(sunnahsData)
    console.log(`✅ Successfully inserted ${inserted.length} new Sunnahs across 8 categories!`)

    await mongoose.disconnect()
    console.log('\n🔌 Database connection closed.')
  } catch (error) {
    console.error('❌ Error seeding sunnahs:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedSunnahs()
