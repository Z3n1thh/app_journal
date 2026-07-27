import { describe, it, expect } from 'vitest'
import { isHealthAvailable } from './health'

describe('health', () => {
  it('returns unavailable on web', async () => {
    const result = await isHealthAvailable()
    expect(result.available).toBe(false)
  })
})
