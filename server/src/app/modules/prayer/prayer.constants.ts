export const PRAYER_NAME = {
  fajr: 'fajr',
  dhuhr: 'dhuhr',
  asr: 'asr',
  maghrib: 'maghrib',
  isha: 'isha',
} as const

export type TPrayerName = keyof typeof PRAYER_NAME