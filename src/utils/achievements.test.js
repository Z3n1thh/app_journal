import { describe, it, expect } from 'vitest'
import { checkAchievements, buildAchievementData } from './achievements'
import { DEFAULT_HABITS } from '../constants'

describe('achievements', () => {
  it('unlocks streak-7 achievement', () => {
    const entries = {}
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      entries[key] = { mood: 'good', habits: {} }
    }
    const { newlyUnlocked } = checkAchievements(entries, DEFAULT_HABITS, [])
    expect(newlyUnlocked.some((a) => a.id === 'streak-7')).toBe(true)
  })

  it('builds achievement data', () => {
    const data = buildAchievementData({ '2026-07-01': { mood: 'good', gratitude: 'sun' } }, DEFAULT_HABITS)
    expect(data.totalDays).toBe(1)
    expect(data.gratitudeDays).toBe(1)
  })
})
