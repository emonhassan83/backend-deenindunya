import AppError from '../../errors/AppError'
import httpStatus from 'http-status'
import { User } from '../user/user.model'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import axios from 'axios'
import { Reminder } from '../reminders/reminders.models'
import QueryBuilder from '../../builder/QueryBuilder'
import { USER_ROLE, USER_STATUS } from '../user/user.constant'
import { Notification } from '../notification/notification.model'
import { getEarningOverview, getUserOverview } from './meta.utils'
import Payment from '../payments/payments.models'
import { getCache, setCache } from '../../redis/helpers'
import { REDIS_KEYS } from '../../redis/keys'

dayjs.extend(dayOfYear)

// Total ayahs in the Quran
const TOTAL_QURAN_AYAHS = 6236

/**
 * Deterministic "Verse of the Day" — same verse for all users on the same day.
 * Fetches Arabic + English from Al-Quran Cloud API, cached in Redis until next day.
 */
const getVerseOfTheDay = async (dateStr: string) => {
  // Check Redis cache first
  const cacheKey = REDIS_KEYS.VERSE_OF_DAY(dateStr)
  const cached = await getCache<any>(cacheKey)
  if (cached) return cached

  // Deterministic ayah number based on day of year + year
  const today = dayjs(dateStr)
  const seed = today.dayOfYear() + today.year()
  const ayahNumber = (seed % TOTAL_QURAN_AYAHS) + 1

  try {
    const response = await axios.get(
      `https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,en.asad`,
      { timeout: 8000 }
    )

    if (response.data?.code !== 200 || !response.data?.data?.length) {
      return null
    }

    const [arabicEdition, englishEdition] = response.data.data

    const verse = {
      arabicText: arabicEdition.text,
      translation: englishEdition.text,
      surahName: arabicEdition.surah.englishName,
      surahNameArabic: arabicEdition.surah.name,
      surahNumber: arabicEdition.surah.number,
      verseNumber: arabicEdition.numberInSurah,
      reference: `Qur'an ${arabicEdition.surah.number}:${arabicEdition.numberInSurah}`,
    }

    // Cache until end of day (max 24h = 86400s)
    const secondsLeftInDay = dayjs(dateStr).endOf('day').diff(dayjs(), 'second')
    const ttl = Math.max(secondsLeftInDay, 60) // at least 60s
    await setCache(cacheKey, verse, Math.min(ttl, 86400))

    return verse
  } catch (error: any) {
    console.error('Verse of the Day API error:', error.message)
    return null
  }
}

const ADHKAR_DATA_URL =
  'https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/main/result/en.json'
const REQUESTED_ADHKAR_REFERENCE = 'Abu Dawood 4/323 | At-Trimithi 5/465'
const REQUESTED_ADHKAR_TRANSLITERATION =
  "Bismillah hil’lazee la yadur’oo ma’aas-mihi shai-oon fil-ardi wa’laa fis-samaa; Wa’hu’waas samee’ool aa’leem."

const fetchAdhkarList = async (): Promise<any[]> => {
  const cacheKey = 'meta:adhkar:raw-list'
  const cached = await getCache<any[]>(cacheKey)
  if (Array.isArray(cached) && cached.length) return cached

  try {
    const response = await axios.get(ADHKAR_DATA_URL, { timeout: 8000 })
    if (!Array.isArray(response.data)) return []

    await setCache(cacheKey, response.data, 86400)
    return response.data
  } catch (error: any) {
    console.error('Failed to fetch Adhkar list:', error.message)
    return []
  }
}

const getMorningAndEveningAdhkar = async () => {
  const allAdhkar = await fetchAdhkarList()
  const selected = allAdhkar.find(
    (item) =>
      item.order === 20 &&
      item.type === 0 &&
      item.audio &&
      item.content?.includes('لاَ يَضُرُّ'),
  )

  if (!selected) return null

  return {
    arabic_text: selected.content,
    translation: selected.translation,
    transliteration: REQUESTED_ADHKAR_TRANSLITERATION,
    reference: REQUESTED_ADHKAR_REFERENCE,
    audio_url: selected.audio,
    benefit: selected.fadl,
    count: selected.count,
    count_description: selected.count_description,
  }
}

const userMeta = async (userId: string, query: Record<string, any>) => {
  const user = await User.findById(userId)
  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Your profile not found')
  }

  const { latitude, longitude, timezone } = user
  const { date } = query

  if (!latitude || !longitude) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Location not set. Please update your profile with latitude and longitude.',
    )
  }

  // Date format for Aladhan API
  let targetDate: string
  if (date) {
    targetDate = dayjs(date).format('DD-MM-YYYY')
  } else {
    targetDate = dayjs().format('DD-MM-YYYY')
  }

  // ISO date for verse/adhkar cache keys
  const isoDate = date ? dayjs(date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')

  try {
    // The requested dua has type 0 (both morning and evening) and includes audio.
    const sharedAdhkar = getMorningAndEveningAdhkar()

    // Run all fetches in parallel for performance
    const [prayerResponse, verseOfTheDay, morningAdhkar, eveningAdhkar, reminders] = await Promise.all([
      // 1. Prayer Times from Aladhan API
      axios.get(`https://api.aladhan.com/v1/timings/${targetDate}`, {
        params: {
          latitude,
          longitude,
          method: 2,
          ...(timezone && { timezonestring: timezone }),
        },
      }),

      // 2. Verse of the Day
      getVerseOfTheDay(isoDate),

      // 3. Morning Adhkar
      sharedAdhkar,

      // 4. Evening Adhkar
      sharedAdhkar,

      // 5. Reminders for this date
      Reminder.find({
        user: userId,
        logAt: targetDate,
      }).lean(),
    ])

    if (prayerResponse.data.code !== 200) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to fetch prayer times from Aladhan API',
      )
    }

    const timings = prayerResponse.data.data.timings
    const dateInfo = prayerResponse.data.data.date

    const prayerTimes = {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      date: {
        readable: dateInfo.readable,
        gregorian: dateInfo.gregorian.date,
        hijri: dateInfo.hijri.date,
      },
    }

    return {
      prayerTimes,
      verseOfTheDay,
      morningAdhkar,
      eveningAdhkar,
      reminders,
    }
  } catch (error: any) {
    console.error('Prayer Times Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })

    if (error instanceof AppError) throw error

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch prayer times',
    )
  }
}

const adminMeta = async (userId: string, query: Record<string, any>) => {
  const { earning_year, user_year, ...othersQuery } = query;

  const activeUserCount = await User.countDocuments({
    isDeleted: false,
    role: { $ne: USER_ROLE.admin },
    status: USER_STATUS.active,
  });

  const recentNotifications = await Notification.find({
    receiver: userId,
  }).limit(10);

  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

  const selectedEarningYear = earning_year
    ? parseInt(earning_year as string, 10) || new Date().getFullYear()
    : new Date().getFullYear();

  const selectedUserYear = user_year
    ? parseInt(user_year as string, 10) || new Date().getFullYear()
    : new Date().getFullYear();

  const earningOverview = await getEarningOverview(selectedEarningYear);
  const userOverview = await getUserOverview(selectedUserYear);

  const usersQuery = new QueryBuilder(
    User.find({ isDeleted: false, role: { $ne: USER_ROLE.admin } }).select(
      '_id id name email photoUrl address contractNumber status createdAt',
    ),
    othersQuery,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await usersQuery.modelQuery;
  const meta = await usersQuery.countTotal();

  return {
    meta,
    result: {
      totalUser: meta.total,
      activeUser: activeUserCount,
      totalRevenue: revenue,
      userList: result,
      recentNotifications,
      earningOverview,
      userOverview,
    },
  };
};

export const MetaService = {
  userMeta,
  adminMeta,
}
