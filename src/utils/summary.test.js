import { describe, it, expect } from 'vitest'
import { generateWeeklySummary, compareMonths } from './summary'
import { DEFAULT_HABITS, DEFAULT_MOODS } from '../constants'

describe('summary', () => {
  const t = (key, vars = {}) => {
    const map = {
      'summary.intro': 'Based on your entries:',
      'summary.sleep': `Sleep ${vars.h}h`,
      'summary.mood': `Mood ${vars.mood}`,
      'summary.habit': `${vars.habit} ${vars.n}x`,
      'summary.streak': `Streak ${vars.n}`,
    }
    return map[key] || key
  }

  it('generates weekly summary lines', () => {
    const entries = {
      '2026-07-27': { mood: 'good', sleepHours: 8, habits: { water: true } },
    }
    const lines = generateWeeklySummary(entries, DEFAULT_HABITS, DEFAULT_MOODS, t, 'en')
    expect(lines.length).toBeGreaterThan(1)
  })

  it('compares months', () => {
    const entries = {
      '2026-07-01': { mood: 'good', habits: {} },
      '2026-06-01': { mood: 'okay', habits: {} },
    }
    const cmp = compareMonths(entries, DEFAULT_HABITS, DEFAULT_MOODS, 6, 2026)
    expect(cmp.current.daysLogged).toBe(1)
    expect(cmp.previous.daysLogged).toBe(1)
  })
})
