import { computeInsights, getMoodTrend, MOOD_SCORE } from './insights'
import { getLoggingStreak, getWeekDates, getHabitLabel } from '../constants'
export function generateWeeklySummary(entries, habits, moods, t, lang) {
  const dates = getWeekDates()
  const weekEntries = dates.map((k) => entries[k]).filter(Boolean)
  if (weekEntries.length === 0) return []

  const lines = [t('summary.intro')]

  const sleepVals = weekEntries.filter((e) => e.sleepHours != null).map((e) => e.sleepHours)
  if (sleepVals.length) {
    const avg = (sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1)
    lines.push(t('summary.sleep', { h: avg }))
  }

  const moodCounts = {}
  weekEntries.forEach((e) => { if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1 })
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
  if (topMood) {
    const mood = moods.find((m) => m.id === topMood[0])
    lines.push(t('summary.mood', { mood: mood?.emoji ? `${mood.emoji} ${t(`moods.${mood.id}`)}` : topMood[0] }))
  }

  const habitTotals = {}
  weekEntries.forEach((e) => {
    habits.forEach((h) => { if (e.habits?.[h.id]) habitTotals[h.id] = (habitTotals[h.id] || 0) + 1 })
  })
  const topHabit = Object.entries(habitTotals).sort((a, b) => b[1] - a[1])[0]
  if (topHabit) {
    const h = habits.find((x) => x.id === topHabit[0])
    lines.push(t('summary.habit', { habit: h ? getHabitLabel(h, lang) : topHabit[0], n: topHabit[1] }))
  }

  const streak = getLoggingStreak(entries)
  if (streak > 0) lines.push(t('summary.streak', { n: streak }))

  const lowDays = weekEntries.filter((e) => e.mood && MOOD_SCORE[e.mood] <= 2).length
  const highDays = weekEntries.filter((e) => e.mood && MOOD_SCORE[e.mood] >= 4).length
  if (lowDays >= 2) lines.push(t('summary.lowDays', { n: lowDays }))
  if (highDays >= 3) lines.push(t('summary.highDays', { n: highDays }))

  const taggedStress = weekEntries.filter((e) => e.tags?.includes('stress')).length
  if (taggedStress >= 2) lines.push(t('summary.stressDays', { n: taggedStress }))

  const gratitudeDays = weekEntries.filter((e) => e.gratitude?.trim()).length
  if (gratitudeDays >= 2) lines.push(t('summary.gratitudeDays', { n: gratitudeDays }))

  return lines
}

export function compareMonths(entries, habits, moods, month, year) {
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const current = computeInsights(entries, habits, moods, month, year)
  const previous = computeInsights(entries, habits, moods, prevMonth, prevYear)
  return { current, previous, prevMonth, prevYear }
}
