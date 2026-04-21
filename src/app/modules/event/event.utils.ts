export const ISLAMIC_EVENTS = [
  // Muharram (মহররম)
  {
    title: 'Islamic New Year',
    description: 'The first day of Muharram, marking the beginning of the Islamic lunar calendar.',
    hijriMonth: 1,
    hijriDay: 1,
    recurrence: 'yearly'
  },
  {
    title: 'Fasting on Ashura (9th Muharram)',
    description: 'Recommended to fast on the 9th of Muharram along with the 10th.',
    hijriMonth: 1,
    hijriDay: 9,
    recurrence: 'yearly'
  },
  {
    title: 'Day of Ashura',
    description: 'The 10th day of Muharram. Fasting on this day expiates sins of the previous year.',
    hijriMonth: 1,
    hijriDay: 10,
    recurrence: 'yearly'
  },

  // Rabi' al-awwal (রবিউল আউয়াল)
  {
    title: 'Mawlid al-Nabi (Prophet\'s Birthday)',
    description: 'Birth anniversary of Prophet Muhammad (PBUH), observed on 12th Rabi\' al-awwal.',
    hijriMonth: 3,
    hijriDay: 12,
    recurrence: 'yearly'
  },

  // Rajab (রজব)
  {
    title: 'Beginning of Rajab',
    description: 'The first of the four sacred months. Increase worship and seek forgiveness.',
    hijriMonth: 7,
    hijriDay: 1,
    recurrence: 'yearly'
  },
  {
    title: 'Isra and Mi\'raj (Night Journey)',
    description: 'The Night Journey and Ascension of Prophet Muhammad (PBUH) to the heavens.',
    hijriMonth: 7,
    hijriDay: 27,
    recurrence: 'yearly'
  },

  // Sha'ban (শাবান)
  {
    title: 'Beginning of Sha\'ban',
    description: 'The month preceding Ramadan. Prophet Muhammad (PBUH) used to fast frequently this month.',
    hijriMonth: 8,
    hijriDay: 1,
    recurrence: 'yearly'
  },
  {
    title: 'Mid-Sha\'ban (Night of Forgiveness)',
    description: 'A night of forgiveness. It is believed that Allah forgives those who seek repentance.',
    hijriMonth: 8,
    hijriDay: 15,
    recurrence: 'yearly'
  },

  // Ramadan (রমজান)
  {
    title: 'First Day of Ramadan',
    description: 'The beginning of the holy month of fasting. Muslims fast from dawn to sunset.',
    hijriMonth: 9,
    hijriDay: 1,
    recurrence: 'yearly'
  },
  {
    title: 'Last 10 Days of Ramadan',
    description: 'The final 10 days of Ramadan. Seek Laylat al-Qadr and increase I\'tikaf.',
    hijriMonth: 9,
    hijriDay: 21,
    recurrence: 'yearly'
  },
  {
    title: 'Laylat al-Qadr (Night of Power)',
    description: 'The most virtuous night of the year. Worship on this night is better than 1000 months.',
    hijriMonth: 9,
    hijriDay: 27,
    recurrence: 'yearly'
  },
  {
    title: 'Last Friday of Ramadan',
    description: 'The final Jumu\'ah of Ramadan. A special day for supplication and charity.',
    hijriMonth: 9,
    hijriDay: 29,
    recurrence: 'yearly'
  },

  // Shawwal (শাওয়াল)
  {
    title: 'Eid al-Fitr',
    description: 'The Festival of Breaking Fast. Celebrated on the first day of Shawwal after Ramadan.',
    hijriMonth: 10,
    hijriDay: 1,
    recurrence: 'yearly'
  },
  {
    title: 'Six Days of Shawwal',
    description: 'Recommended to fast six days in Shawwal. It completes the reward of fasting the whole year.',
    hijriMonth: 10,
    hijriDay: 2,
    recurrence: 'yearly'
  },

  // Dhul Qa'dah (জিলকদ)
  {
    title: 'Beginning of Dhul Qa\'dah',
    description: 'The second sacred month. One of the months in which fighting was prohibited.',
    hijriMonth: 11,
    hijriDay: 1,
    recurrence: 'yearly'
  },

  // Dhul Hijjah (জিলহজ্জ)
  {
    title: 'First 10 Days of Dhul Hijjah',
    description: 'The best days of the year for good deeds. Increase worship, charity, and fasting.',
    hijriMonth: 12,
    hijriDay: 1,
    recurrence: 'yearly'
  },
  {
    title: 'Day of Arafah',
    description: 'The most important day of Hajj. Fasting on this day expiates sins of two years.',
    hijriMonth: 12,
    hijriDay: 9,
    recurrence: 'yearly'
  },
  {
    title: 'Eid al-Adha (Festival of Sacrifice)',
    description: 'Commemorates Prophet Ibrahim\'s willingness to sacrifice his son for Allah.',
    hijriMonth: 12,
    hijriDay: 10,
    recurrence: 'yearly'
  },
  {
    title: 'Days of Tashriq',
    description: 'The 11th, 12th, and 13th of Dhul Hijjah. Days of eating, drinking, and remembering Allah.',
    hijriMonth: 12,
    hijriDay: 11,
    recurrence: 'yearly'
  }
]

// Helper: Group events by month
export const groupEventsByMonth = (events: any[]) => {
  const grouped: Record<string, any[]> = {}
  
  for (const event of events) {
    const month = event.date.substring(0, 7) // YYYY-MM
    if (!grouped[month]) {
      grouped[month] = []
    }
    grouped[month].push(event)
  }
  
  return grouped
}

// Helper function to get month name
export const getMonthName = (month: number): string => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return monthNames[month - 1]
}