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
import { Surah, SurahVerse } from '../surah/surah.models'
import {
  calculatePrayerTimes,
  getTodayInTimezone,
} from '../../utils/prayerTimes'

dayjs.extend(dayOfYear)

/**
 * Deterministic "Verse of the Day" — same verse for all users on the same day.
 * Reads from the seeded Surah/SurahVerse collections, cached in Redis until next day.
 */
const getVerseOfTheDay = async (dateStr: string) => {
  // Check Redis cache first
  const cacheKey = REDIS_KEYS.VERSE_OF_DAY(dateStr)
  const cached = await getCache<any>(cacheKey)
  if (cached) return cached

  try {
    const surahs = await Surah.find()
      .select('number name nameArabic totalVerses')
      .sort({ number: 1 })
      .lean()

    const totalAyahs = surahs.reduce((sum, s) => sum + s.totalVerses, 0)
    if (!totalAyahs) return null

    // Deterministic ayah number based on day of year + year
    const today = dayjs(dateStr)
    const seed = today.dayOfYear() + today.year()
    let remaining = (seed % totalAyahs) + 1

    const surah = surahs.find((s) => {
      if (remaining <= s.totalVerses) return true
      remaining -= s.totalVerses
      return false
    })
    if (!surah) return null

    const ayah = await SurahVerse.findOne({
      surahId: surah._id,
      verseNumber: remaining,
    })
      .select('arabicText translation verseNumber')
      .lean()
    if (!ayah) return null

    const verse = {
      arabicText: ayah.arabicText,
      translation: ayah.translation,
      surahName: surah.name,
      surahNameArabic: surah.nameArabic,
      surahNumber: surah.number,
      verseNumber: ayah.verseNumber,
      reference: `Qur'an ${surah.number}:${ayah.verseNumber}`,
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

  const isoDate = date
    ? dayjs(date).format('YYYY-MM-DD')
    : getTodayInTimezone(timezone)
  const targetDate = dayjs(isoDate).format('DD-MM-YYYY')

  const prayerTimes = calculatePrayerTimes({
    latitude,
    longitude,
    date: isoDate,
    timezone,
  })

  // The requested dua has type 0 (both morning and evening) and includes audio.
  const sharedAdhkar = getMorningAndEveningAdhkar()

  const [verseOfTheDay, morningAdhkar, eveningAdhkar, reminders] =
    await Promise.all([
      getVerseOfTheDay(isoDate),
      sharedAdhkar,
      sharedAdhkar,
      Reminder.find({
        user: userId,
        logAt: targetDate,
      }).lean(),
    ])

  return {
    prayerTimes,
    verseOfTheDay,
    morningAdhkar,
    eveningAdhkar,
    reminders,
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
