import { describe, it, expect, beforeEach, vi } from 'vitest'

const store = {}
vi.stubGlobal('localStorage', {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v },
  removeItem: (k) => { delete store[k] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
})

vi.mock('./utils/db', () => ({
  storageSet: (k, v) => {
    const raw = typeof v === 'string' ? v : JSON.stringify(v)
    store[k] = raw
    return Promise.resolve()
  },
}))

import { saveEntries, loadEntries, getFullBackup, importBackup } from './storage'

describe('storage backup roundtrip', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exports and imports entries', () => {
    saveEntries({ '2026-07-01': { mood: 'good', habits: {} } })
    const backup = getFullBackup()
    localStorage.clear()
    importBackup(backup)
    expect(loadEntries()['2026-07-01'].mood).toBe('good')
  })

  it('loadEntries returns fallback when stored null', () => {
    localStorage.setItem('bujo-entries', 'null')
    expect(loadEntries()).toEqual({})
  })
})
