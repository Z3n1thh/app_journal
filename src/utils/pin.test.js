import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin } from './pin'

describe('pin', () => {
  it('hashes and verifies pin', async () => {
    const hash = await hashPin('1234')
    expect(await verifyPin('1234', hash)).toBe(true)
    expect(await verifyPin('9999', hash)).toBe(false)
  })

  it('allows unlock when no hash set', async () => {
    expect(await verifyPin('anything', null)).toBe(true)
  })
})
