import { describe, it, expect } from 'vitest'
import { searchEntries, groupResultsByMonth } from './search'
import { DEFAULT_MOODS } from '../constants'

describe('searchEntries', () => {
  const entries = {
    '2026-07-01': { mood: 'good', note: 'Great day at work', tags: ['work'], habits: {} },
    '2026-07-02': { mood: 'bad', note: 'Feeling sick', tags: ['sick'], habits: {} },
    '2026-03-15': { mood: 'good', note: 'Spring walk', tags: ['exercise'], habits: {} },
  }

  it('returns empty for blank query without filters', () => {
    expect(searchEntries(entries, '', DEFAULT_MOODS)).toEqual([])
  })

  it('finds by note text', () => {
    const results = searchEntries(entries, 'work', DEFAULT_MOODS)
    expect(results).toHaveLength(1)
    expect(results[0][0]).toBe('2026-07-01')
  })

  it('finds by tag', () => {
    const results = searchEntries(entries, 'sick', DEFAULT_MOODS)
    expect(results).toHaveLength(1)
  })

  it('filters by date range', () => {
    const results = searchEntries(entries, '', DEFAULT_MOODS, { from: '2026-07-01', to: '2026-07-31' })
    expect(results).toHaveLength(2)
  })

  it('filters by mood', () => {
    const results = searchEntries(entries, '', DEFAULT_MOODS, { mood: 'good' })
    expect(results).toHaveLength(2)
  })

  it('groups results by month', () => {
    const results = searchEntries(entries, '', DEFAULT_MOODS, { from: '2026-01-01' })
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const grouped = groupResultsByMonth(results, months)
    expect(Object.keys(grouped)).toContain('July')
    expect(Object.keys(grouped)).toContain('March')
  })
})
