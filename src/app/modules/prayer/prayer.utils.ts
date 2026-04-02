import { TPrayer } from "./prayer.interface"

// Helper: Calculate current streak
export const calculateCurrentStreak = (prayers: TPrayer[]): number => {
  if (prayers.length === 0) return 0

  // Group prayers by date
  const prayersByDate: Record<string, TPrayer[]> = {}
  prayers.forEach(prayer => {
    if (!prayersByDate[prayer.date]) {
      prayersByDate[prayer.date] = []
    }
    prayersByDate[prayer.date].push(prayer)
  })

  // Get unique dates sorted in descending order
  const dates = Object.keys(prayersByDate).sort().reverse()

  let streak = 0
  for (const date of dates) {
    const dayPrayers = prayersByDate[date]
    const allPrayed = dayPrayers.every(p => p.prayed)

    if (allPrayed) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Helper: Calculate longest streak
export const calculateLongestStreak = (prayers: TPrayer[]): number => {
  if (prayers.length === 0) return 0

  // Group prayers by date
  const prayersByDate: Record<string, TPrayer[]> = {}
  prayers.forEach(prayer => {
    if (!prayersByDate[prayer.date]) {
      prayersByDate[prayer.date] = []
    }
    prayersByDate[prayer.date].push(prayer)
  })

  // Get unique dates sorted
  const dates = Object.keys(prayersByDate).sort()

  let maxStreak = 0
  let currentStreak = 0

  for (const date of dates) {
    const dayPrayers = prayersByDate[date]
    const allPrayed = dayPrayers.every(p => p.prayed)

    if (allPrayed) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}