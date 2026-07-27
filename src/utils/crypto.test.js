import { describe, it, expect } from 'vitest'
import { encryptBackup, decryptBackup } from './crypto'

describe('crypto', () => {
  it('encrypts and decrypts backup', async () => {
    const json = JSON.stringify({ app: 'bujo-mood-tracker', test: true })
    const encrypted = await encryptBackup(json, 'test-password')
    const decrypted = await decryptBackup(encrypted, 'test-password')
    expect(JSON.parse(decrypted).test).toBe(true)
  })
})
