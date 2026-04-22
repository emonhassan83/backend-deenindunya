import dayjs from "dayjs"
import { Prayer } from "./prayer.models"

export const calculateCurrentStreak = async (userId: string): Promise<number> => {
  let streak = 0
  let currentDate = dayjs()
  
  while (true) {
    const dateStr = currentDate.format('YYYY-MM-DD')
    
    const prayers = await Prayer.find({
      user: userId,
      date: dateStr,
    })
    
    const totalPrayers = prayers.length
    const completedPrayers = prayers.filter((p) => p.prayed).length
    
    // If all prayers are completed for this day
    if (totalPrayers === 5 && completedPrayers === 5) {
      streak++
      currentDate = currentDate.subtract(1, 'day')
    } else {
      break
    }
  }
  
  return streak
}

// Calculate longest streak
export const calculateLongestStreak = async (userId: string): Promise<number> => {
  const allPrayers = await Prayer.find({ user: userId })
    .sort({ date: 1 })
    .lean()
  
  // Group by date
  const prayersByDate: Record<string, any[]> = {}
  for (const prayer of allPrayers) {
    if (!prayersByDate[prayer.date]) {
      prayersByDate[prayer.date] = []
    }
    prayersByDate[prayer.date].push(prayer)
  }
  
  let longestStreak = 0
  let currentStreak = 0
  let previousDate: string | null = null
  
  const dates = Object.keys(prayersByDate).sort()
  
  for (const date of dates) {
    const prayers = prayersByDate[date]
    const totalPrayers = prayers.length
    const completedPrayers = prayers.filter((p) => p.prayed).length
    
    // Check if this is a consecutive day
    if (previousDate) {
      const prev = dayjs(previousDate)
      const curr = dayjs(date)
      const diff = curr.diff(prev, 'day')
      
      if (diff !== 1) {
        currentStreak = 0
      }
    }
    
    // If all prayers are completed
    if (totalPrayers === 5 && completedPrayers === 5) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
    
    previousDate = date
  }
  
  return longestStreak
}