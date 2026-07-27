import { describe, it, expect } from 'vitest'
import { computeInsights, computeYearReview, getMoodTrend } from './insights'
import { DEFAULT_MOODS, DEFAULT_HABITS } from '../constants'

describe('computeInsights', () => {
  it('returns empty stats for month with no entries', () => {
    const result = computeInsights({}, DEFAULT_HABITS, DEFAULT_MOODS, 6, 2026)
    expect(result.daysLogged).toBe(0)
    expect(result.topMood).toBeNull()
    expect(result.moodTrend).toHaveLength(30)
  })

  it('counts moods in month', () => {
    const entries = {
      '2026-07-01': { mood: 'good', habits: {}, energy: 'high', sleepHours: 8, waterGlasses: 6 },
      '2026-07-02': { mood: 'good', habits: {}, energy: 'low' },
    }
    const result = computeInsights(entries, DEFAULT_HABITS, DEFAULT_MOODS, 6, 2026)
    expect(result.daysLogged).toBe(2)
    expect(result.topMood.id).toBe('good')
    expect(result.avgSleep).toBe('8.0')
    expect(result.heatmap).toHaveLength(DEFAULT_HABITS.length)
  })
})

describe('computeYearReview', () => {
  it('summarizes a year', () => {
    const entries = {
      '2026-01-05': { mood: 'great', habits: { water: true } },
      '2026-07-01': { mood: 'good', habits: { water: true } },
    }
    const review = computeYearReview(entries, DEFAULT_HABITS, 2026)
    expect(review.daysLogged).toBe(2)
    expect(review.topMood).toBeTruthy()
  })
})

describe('getMoodTrend', () => {
  it('returns 30 points', () => {
    expect(getMoodTrend({}, 30)).toHaveLength(30)
  })
})
