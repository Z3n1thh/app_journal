import { describe, it, expect } from 'vitest'
import { buildWeeklyContext } from './aiSummary'
import { DEFAULT_HABITS, DEFAULT_MOODS, todayKey } from '../constants'

describe('aiSummary', () => {
  const t = (key, vars = {}) => {
    const map = {
      'moods.good': 'Good',
      'summary.intro': 'Based on your entries:',
      'summary.sleep': `Sleep ${vars.h}h`,
      'summary.streak': `Streak ${vars.n}`,
    }
    return map[key] || key
  }

  it('builds weekly context from entries', () => {
    const key = todayKey()
    const entries = {
      [key]: { mood: 'good', sleepHours: 8, habits: { water: true }, tags: ['work'] },
    }
    const ctx = buildWeeklyContext(entries, DEFAULT_HABITS, DEFAULT_MOODS, t, 'en')
    expect(ctx.daysLogged).toBe(1)
    expect(ctx.ruleLines.length).toBeGreaterThan(1)
    expect(ctx.avgSleep).toBe('8.0')
  })
})
