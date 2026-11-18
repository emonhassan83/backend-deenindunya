import mongoose from 'mongoose'
import config from '../config'
import { Sunnah, SunnaMemorizedLog } from '../modules/sunnah/sunnah.models'
import { TSunnah } from '../modules/sunnah/sunnah.interface'

const sunnahsData: Omit<TSunnah, '_id'>[] = [
  // 1. Morning & Evening Sunnahs
  {
    category: 'Morning & Evening Sunnahs',
    title: 'Dua Upon Waking Up',
    subtitle:
      'Praising Allah for granting life after sleep when waking up in the morning.',
    arabicText:
      'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration:
      "Alhamdu lillahil-lathee ahyana ba'da ma amatana wa-ilayhin-nushoor.",
    translation:
      'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
    reference: 'Sahih al-Bukhari 6312',
    howToPractise:
      'Recite this supplication immediately upon opening your eyes and waking from sleep. Wipe the traces of sleep from your face with your hands and remember Allah.',
    isDeleted: false,
  },
  {
    category: 'Morning & Evening Sunnahs',
    title: 'Morning Remembrance (Adhkar)',
    subtitle:
      'Entering the morning in the remembrance and protection of Allah.',
    arabicText:
      'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration:
      'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namootu wa ilaykan-nushoor.',
    translation:
      'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and unto You is the resurrection.',
    reference: 'Sunan Abi Dawud 5068, Jami` at-Tirmidhi 3391',
    howToPractise:
      'Recite this adhkar in the morning after Fajr prayer before starting your daily activities.',
    isDeleted: false,
  },
  {
    category: 'Morning & Evening Sunnahs',
    title: 'Evening Remembrance (Adhkar)',
    subtitle: 'Entering the evening seeking Allah’s protection and blessings.',
    arabicText:
      'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    transliteration:
      'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namoot, wa ilaykal-maseer.',
    translation:
      'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and unto You is the final return.',
    reference: 'Jami` at-Tirmidhi 3391',
    howToPractise:
      'Recite this adhkar after Asr or Maghrib prayer to seek Allah’s protection throughout the evening and night.',
    isDeleted: false,
  },

  // 2. Eating & Drinking Sunnahs
  {
    category: 'Eating & Drinking Sunnahs',
    title: 'Saying Bismillah Before Eating',
    subtitle:
      'Mentioning the name of Allah and eating with the right hand from what is nearest.',
    arabicText: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    transliteration: "Bismillahi wa 'ala barakatillah.",
    translation: 'In the name of Allah and upon the blessings of Allah.',
    reference: 'Sahih al-Bukhari 5376, Sahih Muslim 2022',
    howToPractise:
      'Wash your hands before eating, sit humbly, say Bismillah, eat with your right hand, and eat from what is directly in front of you.',
    isDeleted: false,
  },
  {
    category: 'Eating & Drinking Sunnahs',
    title: 'Dua After Eating',
    subtitle:
      'Thanking Allah for providing food and sustenance without our own might or power.',
    arabicText:
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration:
      "Alhamdu lillahil-lathee at'amana hatha wa razaqaneehi min ghayri hawlin minnee wa la quwwah.",
    translation:
      'All praise is due to Allah who fed me this and provided it for me without any might or power from myself.',
    reference: 'Jami` at-Tirmidhi 3458, Sunan Abi Dawud 4023',
    howToPractise:
      'Praise Allah sincerely as soon as you finish eating and drinking, acknowledging that all sustenance comes purely from His bounty.',
    isDeleted: false,
  },
  {
    category: 'Eating & Drinking Sunnahs',
    title: 'Drinking Water in Three Sips Sitting Down',
    subtitle:
      'Drinking with the right hand while sitting, taking three breaths, and praising Allah after finishing.',
    arabicText: 'بِسْمِ اللَّهِ ... الْحَمْدُ لِلَّهِ',
    transliteration:
      'Bismillah (before each sip) ... Alhamdulillah (after finishing).',
    translation: 'In the name of Allah ... All praise is due to Allah.',
    reference: 'Sahih Muslim 2024, Sahih al-Bukhari 5631',
    howToPractise:
      'Sit down before drinking, hold the cup with your right hand, avoid breathing into the vessel, and pause to take breaths in three distinct sips.',
    isDeleted: false,
  },

  // 3. Personal Hygiene & Cleanliness
  {
    category: 'Personal Hygiene & Cleanliness',
    title: 'Using the Miswak (Toothstick)',
    subtitle:
      'Purifying the mouth and pleasing the Lord, especially upon waking and before prayer.',
    arabicText: 'السِّوَاكُ مَطْهَرَةٌ لِلْفَمِ مَرْضَاةٌ لِلرَّبِّ',
    transliteration: 'As-siwaku mat-haratun lil-fami, mardatun lir-Rabb.',
    translation: 'The Miswak cleanses the mouth and pleases the Lord.',
    reference: "Sunan an-Nasa'i 5, Sahih al-Bukhari (Book 30, Hadith 13)",
    howToPractise:
      'Use the miswak or brush your teeth upon waking up, before performing wudu, before prayer, and before reading the Quran.',
    isDeleted: false,
  },
  {
    category: 'Personal Hygiene & Cleanliness',
    title: 'Maintaining Purity and Cleanliness',
    subtitle:
      'Keeping the body, garments, and surroundings clean and pure as part of faith.',
    arabicText: 'الطُّهُورُ شَطْرُ الْإِيمَانِ',
    transliteration: 'At-tuhooru shatrul-eeman.',
    translation: 'Purity and cleanliness are half of faith.',
    reference: 'Sahih Muslim 223',
    howToPractise:
      'Perform Wudu attentively, keep your garments clean, trim nails, and maintain cleanliness in your home and prayer space.',
    isDeleted: false,
  },
  {
    category: 'Personal Hygiene & Cleanliness',
    title: 'Practising the Acts of Fitrah (Grooming)',
    subtitle:
      'Trimming nails, maintaining neat hair, and observing personal hygiene regularly.',
    arabicText:
      'الْفِطْرَةُ خَمْسٌ: الْخِتَانُ، وَالِاسْتِحْدَادُ، وَقَصُّ الشَّارِبِ، وَتَقْلِيمُ الْأَظْفَارِ، وَنَتْفُ الْإِبْطِ',
    transliteration:
      'Al-fitratu khams: al-khitanu, wal-istihadadu, wa qassush-sharibi, wa taqleemul-azfari, wa natful-ibti.',
    translation:
      'Five practices are of the natural disposition: circumcision, shaving pubic hair, trimming the moustache, cutting nails, and plucking armpit hair.',
    reference: 'Sahih al-Bukhari 5889, Sahih Muslim 257',
    howToPractise:
      'Regularly trim your nails, groom facial hair neatly, and maintain personal hygiene at least once a week, preferably before Friday prayer.',
    isDeleted: false,
  },

  // 4. Prayer & Worship
  {
    category: 'Prayer & Worship',
    title: 'Praying the 12 Sunnah Rawatib Prayers',
    subtitle:
      'Consistently performing the regular voluntary prayers before and after obligatory prayers.',
    arabicText:
      'مَنْ صَلَّى اثْنَتَيْ عَشْرَةَ رَكْعَةً فِي يَوْمٍ وَلَيْلَةٍ بُنِيَ لَهُ بِهِنَّ بَيْتٌ فِي الْجَنَّةِ',
    transliteration:
      "Man salla ithnatay 'ashrata rak'atan fee yawmin wa laylatin buniya lahu bihinna baytun fil-jannah.",
    translation:
      'Whoever prays twelve voluntary rak’ahs in a day and night, a house will be built for them in Paradise.',
    reference: 'Sahih Muslim 728, Jami` at-Tirmidhi 415',
    howToPractise:
      'Consistently pray 2 rak’ahs before Fajr, 4 before Dhuhr and 2 after, 2 after Maghrib, and 2 after Isha.',
    isDeleted: false,
  },
  {
    category: 'Prayer & Worship',
    title: 'Reciting Ayat al-Kursi After Every Obligatory Prayer',
    subtitle:
      'Reciting Ayat al-Kursi after each fard salah for Allah’s protection and reward of Paradise.',
    arabicText:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    transliteration:
      'Allahu la ilaha illa huwal-hayyul-qayyoom, la ta’khuthuhu sinatun wa la nawm...',
    translation:
      'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    reference: "Sunan an-Nasa'i (al-Sunan al-Kubra 9928), Sahih al-Jami' 6464",
    howToPractise:
      'Do not rush away after concluding the fard prayer with Taslim; remain seated and recite Ayat al-Kursi with contemplation.',
    isDeleted: false,
  },
  {
    category: 'Prayer & Worship',
    title: 'Tasbih After Obligatory Prayers',
    subtitle:
      'Saying SubhanAllah (33x), Alhamdulillah (33x), and Allahu Akbar (34x) after fard prayers.',
    arabicText: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ',
    transliteration:
      'SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x), La ilaha illallahu wahdahu la shareeka lah...',
    translation:
      'Glory be to Allah (33x), Praise be to Allah (33x), Allah is the Greatest (33x), There is no deity but Allah alone with no partner...',
    reference: 'Sahih Muslim 597',
    howToPractise:
      'Count on the joints of your right fingers after each obligatory prayer to earn forgiveness for sins even if they are like the foam of the sea.',
    isDeleted: false,
  },

  // 5. Character & Good Manners
  {
    category: 'Character & Good Manners',
    title: 'Smiling at Others',
    subtitle:
      'Meeting others with a warm and cheerful face as an act of charity.',
    arabicText: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    transliteration: 'Tabassumuka fee wajhi akheeka laka sadaqah.',
    translation: 'Your smiling in the face of your brother is charity for you.',
    reference: 'Jami` at-Tirmidhi 1956',
    howToPractise:
      'Greet family, colleagues, and neighbours with a pleasant and cheerful expression to spread warmth and goodwill.',
    isDeleted: false,
  },
  {
    category: 'Character & Good Manners',
    title: 'Speaking Good or Remaining Silent',
    subtitle:
      'Guarding the tongue by speaking gently, honestly, and beneficially.',
    arabicText:
      'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    transliteration:
      "Man kana yu'minu billahi wal-yawmil-akhiri fal-yaqul khayran aw li-yasmut.",
    translation:
      'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    reference: 'Sahih al-Bukhari 6018, Sahih Muslim 47',
    howToPractise:
      'Think carefully before speaking; refrain from backbiting, gossiping, anger, or frivolous speech.',
    isDeleted: false,
  },
  {
    category: 'Character & Good Manners',
    title: 'Showing Kindness, Patience, and Gentleness',
    subtitle:
      'Treating people with mercy, patience, and gentleness in all matters.',
    arabicText: 'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الْأَمْرِ كُلِّهِ',
    transliteration: 'Innallaha Rafeequn yuhibbur-rifqa fil-amri kullih.',
    translation: 'Indeed, Allah is Gentle and loves gentleness in all matters.',
    reference: 'Sahih al-Bukhari 6927, Sahih Muslim 2593',
    howToPractise:
      'Respond to harshness with patience, avoid aggression, and deal gently with children, elders, and subordinates.',
    isDeleted: false,
  },

  // 6. Daily Life Sunnahs
  {
    category: 'Daily Life Sunnahs',
    title: 'Dua When Leaving the Home',
    subtitle:
      'Placing trust in Allah when stepping out of the house for daily activities.',
    arabicText:
      'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration:
      "Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah.",
    translation:
      'In the name of Allah, I place my trust in Allah; there is no might nor power except with Allah.',
    reference: 'Sunan Abi Dawud 5095, Jami` at-Tirmidhi 3426',
    howToPractise:
      'Recite this upon stepping out of your front door to be guided, defended, and protected from evil and harm.',
    isDeleted: false,
  },
  {
    category: 'Daily Life Sunnahs',
    title: 'Entering the Home with Bismillah and Salam',
    subtitle:
      'Mentioning Allah’s name upon entering and greeting the household with peace.',
    arabicText:
      'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    transliteration:
      "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna.",
    translation:
      'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.',
    reference: 'Sunan Abi Dawud 5096, Sahih Muslim 2018',
    howToPractise:
      'Step in with your right foot, recite the remembrance of entering, and say As-Salamu Alaykum to your family.',
    isDeleted: false,
  },
  {
    category: 'Daily Life Sunnahs',
    title: 'Spreading the Greeting of Salam & Starting with the Right',
    subtitle:
      'Greeting others with As-Salamu Alaykum and beginning noble actions with the right side.',
    arabicText: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
    transliteration: "As-salamu 'alaykum wa rahmatullahi wa barakatuh.",
    translation: 'May the peace, mercy, and blessings of Allah be upon you.',
    reference: 'Sahih Muslim 54, Sahih al-Bukhari 168',
    howToPractise:
      'Initiate greeting both those you know and those you do not know, and use your right side when wearing shoes, clothes, or eating.',
    isDeleted: false,
  },

  // 7. Sleeping Sunnahs
  {
    category: 'Sleeping Sunnahs',
    title: 'Dua Before Sleeping',
    subtitle:
      'Sleeping in a state of Wudu on the right side and remembering Allah before sleep.',
    arabicText: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amootu wa ahya.',
    translation: 'In Your Name, O Allah, I die and I live.',
    reference: 'Sahih al-Bukhari 6312, Sahih Muslim 2711',
    howToPractise:
      'Perform Wudu before going to bed, lie on your right side with your right hand under your cheek, and recite this dua.',
    isDeleted: false,
  },
  {
    category: 'Sleeping Sunnahs',
    title: 'Reciting the Three Quls and Dusting the Bed',
    subtitle:
      'Dusting the bed three times and reciting Surah Al-Ikhlas, Al-Falaq, and An-Nas into the palms.',
    arabicText:
      'قُلْ هُوَ اللَّهُ أَحَدٌ ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration:
      "Qul huwallahu ahad... Qul a'oothu bi rabbil-falaq... Qul a'oothu bi rabbin-nas...",
    translation:
      'Say: He is Allah, the One... Say: I seek refuge in the Lord of daybreak... Say: I seek refuge in the Lord of mankind...',
    reference: 'Sahih al-Bukhari 5017, Sahih al-Bukhari 6320',
    howToPractise:
      'Dust your bedding three times before lying down. Cup your hands together, blow gently into them, recite Surah Al-Ikhlas, Al-Falaq, and An-Nas, and wipe over your body three times.',
    isDeleted: false,
  },
  {
    category: 'Sleeping Sunnahs',
    title: 'Tasbih Fatimi Before Sleep',
    subtitle:
      'Reciting SubhanAllah (33x), Alhamdulillah (33x), and Allahu Akbar (34x) before going to sleep.',
    arabicText:
      'سُبْحَانَ اللَّهِ (٣٣) وَالْحَمْدُ لِلَّهِ (٣٣) وَاللَّهُ أَكْبَرُ (٣٤)',
    transliteration:
      'SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (34x).',
    translation:
      'Glory be to Allah (33x), Praise be to Allah (33x), Allah is the Greatest (34x).',
    reference: 'Sahih al-Bukhari 3705, Sahih Muslim 2727',
    howToPractise:
      'Recite these phrases in bed before falling asleep; it provides spiritual strength, protection, and relief from exhaustion.',
    isDeleted: false,
  },

  // 8. Friday Sunnahs
  {
    category: 'Friday Sunnahs',
    title: 'Reciting Surah Al-Kahf on Friday',
    subtitle:
      'Reading Surah Al-Kahf on Jumu’ah for illumination and light between the two Fridays.',
    arabicText:
      'مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ',
    transliteration:
      "Man qara'a Sooratal-Kahfi fee yawmil-Jumu'ati ada'a lahu minan-noori ma baynal-jumu'atayn.",
    translation:
      'Whoever reads Surah Al-Kahf on Friday, will have a light that shines for him between the two Fridays.',
    reference: "al-Mustadrak 'ala al-Sahihayn 3392, Sunan al-Bayhaqi 5856",
    howToPractise:
      'Read Surah Al-Kahf anytime between Maghrib on Thursday evening and Maghrib on Friday evening.',
    isDeleted: false,
  },
  {
    category: 'Friday Sunnahs',
    title: 'Sending Abundant Salawat Upon the Prophet (ﷺ)',
    subtitle:
      'Increasing blessings and salutations upon Prophet Muhammad (ﷺ) throughout Friday.',
    arabicText:
      'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    transliteration:
      "Allahumma salli wa sallim wa barik 'ala Nabiyyina Muhammad.",
    translation:
      'O Allah, send peace, blessings, and salutations upon our Prophet Muhammad.',
    reference: "Sunan Abi Dawud 1047, Sunan an-Nasa'i 1374",
    howToPractise:
      'Increase your recitation of Durood / Salawat upon the Prophet (ﷺ) throughout Thursday night and Friday.',
    isDeleted: false,
  },
  {
    category: 'Friday Sunnahs',
    title: 'Performing Ghusl and Going Early to Jumu’ah',
    subtitle:
      'Bathing, wearing clean clothes, applying perfume, and arriving early for Jumu’ah prayer.',
    arabicText:
      'غُسْلُ يَوْمِ الْجُمُعَةِ وَاجِبٌ عَلَى كُلِّ مُحْتَلِمٍ، وَأَنْ يَسْتَنَّ، وَأَنْ يَمَسَّ طِيبًا إِنْ وَجَدَ',
    transliteration:
      "Ghuslu yawmil-Jumu'ati wajibun 'ala kulli muhtalim, wa an yastanna wa an yamassa teeban in wajad.",
    translation:
      'Taking a bath on Friday is an essential duty upon every mature person, as is brushing the teeth and using perfume if available.',
    reference: 'Sahih al-Bukhari 877, Sahih Muslim 846',
    howToPractise:
      'Take a full bath (ghusl), wear clean and preferably white clothes, apply attar/perfume, and proceed early to the mosque to listen to the Khutbah attentively.',
    isDeleted: false,
  },
]

const seedSunnahs = async () => {
  try {
    console.log('📦 Connecting to database...')
    await mongoose.connect(config.database_url as string)
    console.log('✅ Database connected successfully!\n')

    console.log('🗑️ Removing old Sunnah and SunnaMemorizedLog data...')
    const deletedSunnahs = await Sunnah.deleteMany({})
    const deletedLogs = await SunnaMemorizedLog.deleteMany({})
    console.log(
      `   Removed ${deletedSunnahs.deletedCount} old Sunnah(s) and ${deletedLogs.deletedCount} old MemorizedLog(s).\n`,
    )

    console.log('🌱 Inserting new Sunnah data with full authentic fields...')
    const inserted = await Sunnah.insertMany(sunnahsData)
    console.log(
      `✅ Successfully inserted ${inserted.length} new Sunnahs across 8 categories!`,
    )

    await mongoose.disconnect()
    console.log('\n🔌 Database connection closed.')
  } catch (error) {
    console.error('❌ Error seeding sunnahs:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedSunnahs()
