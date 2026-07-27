export async function hashPin(pin) {
  const data = new TextEncoder().encode(`${pin}:bujo-local`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPin(pin, hash) {
  if (!hash) return true
  return (await hashPin(pin)) === hash
}
