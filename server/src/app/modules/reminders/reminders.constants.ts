export const PERMANENT_REMINDERS = [
  'Alhamdulillah – 10x',
  'SubhanAllah – 10x',
  'InshaAllah – 10x',
  'Allahu Akbar – 10x',
  'La ilaha illa Allah – 10x',
] as const

export type TPermanentReminder = (typeof PERMANENT_REMINDERS)[number]
