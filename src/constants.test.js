import { describe, it, expect } from 'vitest'
import { prevDayKey, getWeekDates } from './constants'

describe('constants', () => {
  it('prevDayKey goes back one day', () => {
    expect(prevDayKey('2026-07-02')).toBe('2026-07-01')
  })

  it('getWeekDates returns 7 dates', () => {
    expect(getWeekDates(new Date('2026-07-27'))).toHaveLength(7)
  })
})
