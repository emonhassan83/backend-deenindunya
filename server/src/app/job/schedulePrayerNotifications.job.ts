import moment from 'moment-timezone'
import { User } from '../modules/user/user.model'
import { USER_STATUS } from '../modules/user/user.constant'
import {
  DEFAULT_PRAYER_REMINDER_SETTINGS,
  PRAYER_NAME,
  PRAYER_NOTIFICATION_COPY,
  TPrayerName,
} from '../modules/prayer/prayer.constants'
import { PrayerReminderSetting } from '../modules/prayer/prayerReminder.model'
import { TPrayerReminderSettingsMap } from '../modules/prayer/prayerReminder.interface'
import {
  calculatePrayerTimes,
  getNotifyAtTime,
  resolvePrayerTimezone,
} from '../utils/prayerTimes'
import { getNotificationQueue } from '../queues/queues'
import { setCacheIfNotExists } from '../redis/helpers'
import { REDIS_KEYS } from '../redis/keys'
import { modeType } from '../modules/notification/notification.interface'

const PRAYER_NAMES = Object.values(PRAYER_NAME) as TPrayerName[]
const IDEMPOTENCY_TTL_SECONDS = 26 * 60 * 60

const toSettingsMap = (
  doc?: {
    fajr: { enabled: boolean; offsetMinutes: number }
    dhuhr: { enabled: boolean; offsetMinutes: number }
    asr: { enabled: boolean; offsetMinutes: number }
    maghrib: { enabled: boolean; offsetMinutes: number }
    isha: { enabled: boolean; offsetMinutes: number }
  } | null,
): TPrayerReminderSettingsMap => {
  if (!doc) return { ...DEFAULT_PRAYER_REMINDER_SETTINGS }

  return {
    fajr: {
      enabled: doc.fajr?.enabled ?? true,
      offsetMinutes: (doc.fajr?.offsetMinutes ?? 0) as 0 | 5 | 10,
    },
    dhuhr: {
      enabled: doc.dhuhr?.enabled ?? true,
      offsetMinutes: (doc.dhuhr?.offsetMinutes ?? 0) as 0 | 5 | 10,
    },
    asr: {
      enabled: doc.asr?.enabled ?? true,
      offsetMinutes: (doc.asr?.offsetMinutes ?? 0) as 0 | 5 | 10,
    },
    maghrib: {
      enabled: doc.maghrib?.enabled ?? true,
      offsetMinutes: (doc.maghrib?.offsetMinutes ?? 0) as 0 | 5 | 10,
    },
    isha: {
      enabled: doc.isha?.enabled ?? true,
      offsetMinutes: (doc.isha?.offsetMinutes ?? 0) as 0 | 5 | 10,
    },
  }
}

export const schedulePrayerNotifications = async () => {
  const users = await User.find({
    isDeleted: false,
    status: USER_STATUS.active,
    fcmToken: { $nin: [null, ''] },
    'notificationPreference.pushNotification': { $ne: false },
    latitude: { $exists: true, $ne: 0 },
    longitude: { $exists: true, $ne: 0 },
  })
    .select('_id fcmToken latitude longitude timezone')
    .lean()

  if (!users.length) return

  const userIds = users.map((u) => u._id)
  const settingsDocs = await PrayerReminderSetting.find({
    user: { $in: userIds },
  }).lean()
  const settingsByUser = new Map(
    settingsDocs.map((doc) => [String(doc.user), toSettingsMap(doc)]),
  )

  const queue = getNotificationQueue()
  let enqueued = 0

  for (const user of users) {
    const tz = resolvePrayerTimezone(user.timezone)
    const now = moment().tz(tz).locale('en')
    const date = now.format('YYYY-MM-DD')
    const currentHHmm = now.format('HH:mm')

    const settings =
      settingsByUser.get(String(user._id)) ||
      ({ ...DEFAULT_PRAYER_REMINDER_SETTINGS } as TPrayerReminderSettingsMap)

    const hasEnabled = PRAYER_NAMES.some((p) => settings[p].enabled)
    if (!hasEnabled) continue

    const times = calculatePrayerTimes({
      latitude: user.latitude,
      longitude: user.longitude,
      date,
      timezone: tz,
    })

    for (const prayer of PRAYER_NAMES) {
      const pref = settings[prayer]
      if (!pref.enabled) continue

      const prayerTime = times[prayer]
      const notifyAt = getNotifyAtTime(
        prayerTime,
        pref.offsetMinutes,
        date,
        tz,
      )

      if (notifyAt !== currentHHmm) continue

      const idempotencyKey = REDIS_KEYS.PRAYER_NOTIFY(
        String(user._id),
        date,
        prayer,
        notifyAt,
      )
      const acquired = await setCacheIfNotExists(
        idempotencyKey,
        '1',
        IDEMPOTENCY_TTL_SECONDS,
      )
      if (!acquired) continue

      const copy = PRAYER_NOTIFICATION_COPY[prayer]
      await queue.add(
        'send-notification',
        {
          channel: 'push',
          receiver: String(user._id),
          message: copy.title,
          description: copy.body,
          model_type: modeType.Prayer,
          fcmTokens: [user.fcmToken],
          data: {
            type: 'Prayer',
            prayer,
            offsetMinutes: String(pref.offsetMinutes),
          },
        },
        {
          priority: 2,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
        },
      )
      enqueued += 1
    }
  }

  if (enqueued > 0) {
    console.log(
      `[Prayer Notify] Enqueued ${enqueued} prayer push notification(s)`,
    )
  }
}
