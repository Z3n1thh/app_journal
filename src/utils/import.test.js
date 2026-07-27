import { describe, it, expect } from 'vitest'
import { parseDaylioCSV } from './import'

describe('parseDaylioCSV', () => {
  it('parses Daylio-style CSV', () => {
    const csv = `Date,Mood,Note
2026-07-01,good,Great day
2026-07-02,bad,Bad day`
    const entries = parseDaylioCSV(csv)
    expect(Object.keys(entries)).toHaveLength(2)
    expect(entries['2026-07-01'].mood).toBe('good')
    expect(entries['2026-07-02'].note).toContain('Bad day')
  })
})
