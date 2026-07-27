import { ACHIEVEMENTS } from '../constants/achievements'
import { getLoggingStreak, getHabitStreak } from '../constants'

export function buildAchievementData(entries, habits) {
  const topHabitStreak = habits.reduce((best, h) => Math.max(best, getHabitStreak(entries, h.id)), 0)
  const gratitudeDays = Object.values(entries).filter((e) => e.gratitude?.trim()).length
  const photoDays = Object.values(entries).filter((e) => e.photo).length
  return {
    loggingStreak: getLoggingStreak(entries),
    totalDays: Object.keys(entries).length,
    topHabitStreak,
    gratitudeDays,
    photoDays,
  }
}

export function checkAchievements(entries, habits, unlocked = []) {
  const data = buildAchievementData(entries, habits)
  const unlockedSet = new Set(unlocked)
  const newlyUnlocked = []
  for (const ach of ACHIEVEMENTS) {
    if (!unlockedSet.has(ach.id) && ach.condition(data)) {
      newlyUnlocked.push(ach)
      unlockedSet.add(ach.id)
    }
  }
  return { unlocked: [...unlockedSet], newlyUnlocked }
}

export function getUnlockedAchievements(unlockedIds) {
  const set = new Set(unlockedIds)
  return ACHIEVEMENTS.filter((a) => set.has(a.id))
}
