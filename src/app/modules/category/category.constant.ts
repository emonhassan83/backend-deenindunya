export const categoryType = {
  dua: 'dua',
  hadith: 'hadith',
  quran: 'quran',
  prayerTime: 'prayerTime',
  islamicEvent: 'islamicEvent',
} as const

export type TCategoryType = keyof typeof categoryType