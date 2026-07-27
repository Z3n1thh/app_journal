import { describe, it, expect } from 'vitest'
import { getTriggerInsights, getMedicationInsights } from './insights'

describe('trigger and medication insights', () => {
  const entries = [
    ['2026-07-01', { mood: 'bad', triggers: 'Stress at work and bad sleep' }],
    ['2026-07-02', { mood: 'low', triggers: 'Bråk med familj' }],
    ['2026-07-03', { mood: 'good', triggers: 'fine day' }],
  ]

  it('finds trigger keywords on low mood days', () => {
    const result = getTriggerInsights(entries)
    expect(result.some((r) => r.key === 'work')).toBe(true)
    expect(result.some((r) => r.key === 'stress')).toBe(true)
  })

  it('counts medications', () => {
    const medEntries = [
      ['2026-07-01', { medications: ['Vitamin D'] }],
      ['2026-07-02', { medications: ['Vitamin D', 'Ibuprofen'] }],
    ]
    const result = getMedicationInsights(medEntries)
    expect(result.find((m) => m.name === 'Vitamin D')?.count).toBe(2)
  })
})
