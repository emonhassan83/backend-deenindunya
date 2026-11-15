export const PRAYER_NAME = {
  fajr: 'fajr',
  dhuhr: 'dhuhr',
  asr: 'asr',
  maghrib: 'maghrib',
  isha: 'isha',
} as const

export type TPrayerName = keyof typeof PRAYER_NAME

export const PRAYER_REMINDER_OFFSETS = [0, 5, 10] as const
export type TPrayerReminderOffset = (typeof PRAYER_REMINDER_OFFSETS)[number]

export const PRAYER_NOTIFICATION_COPY: Record<
  TPrayerName,
  { title: string; body: string }
> = {
  fajr: {
    title: "It's time for Fajr",
    body: "Start your day with Salah and seek Allah's blessings.",
  },
  dhuhr: {
    title: "It's time for Dhuhr",
    body: 'Take a moment from your day to remember Allah.',
  },
  asr: {
    title: "It's time for Asr",
    body: 'Answer the call to prayer and strengthen your connection with Allah.',
  },
  maghrib: {
    title: "It's time for Maghrib",
    body: 'Pause and give thanks to Allah for another day.',
  },
  isha: {
    title: "It's time for Isha",
    body: 'Complete your day with Salah and the remembrance of Allah.',
  },
}

export const DEFAULT_PRAYER_REMINDER_PREF = {
  enabled: true,
  offsetMinutes: 0 as TPrayerReminderOffset,
}

export const DEFAULT_PRAYER_REMINDER_SETTINGS = {
  fajr: { ...DEFAULT_PRAYER_REMINDER_PREF },
  dhuhr: { ...DEFAULT_PRAYER_REMINDER_PREF },
  asr: { ...DEFAULT_PRAYER_REMINDER_PREF },
  maghrib: { ...DEFAULT_PRAYER_REMINDER_PREF },
  isha: { ...DEFAULT_PRAYER_REMINDER_PREF },
}
