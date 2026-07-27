const CREDENTIAL_ID_KEY = 'bujo-passkey-id'

function bufToBase64url(buf) {
  const bytes = new Uint8Array(buf)
  let str = ''
  bytes.forEach((b) => { str += String.fromCharCode(b) })
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlToBuf(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf
}

export function hasPasskey() {
  try { return !!localStorage.getItem(CREDENTIAL_ID_KEY) } catch { return false }
}

export function savePasskeyId(rawId) {
  localStorage.setItem(CREDENTIAL_ID_KEY, bufToBase64url(rawId))
}

export function clearPasskeyId() {
  localStorage.removeItem(CREDENTIAL_ID_KEY)
}

export async function registerPasskey(username) {
  if (!window.PublicKeyCredential) throw new Error('unsupported')
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Bujo Mood', id: window.location.hostname || 'localhost' },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: username || 'user',
        displayName: username || 'Bujo User',
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: { userVerification: 'preferred' },
      timeout: 60000,
    },
  })
  savePasskeyId(credential.rawId)
  return true
}

export async function authenticatePasskey() {
  if (!window.PublicKeyCredential) throw new Error('unsupported')
  const stored = localStorage.getItem(CREDENTIAL_ID_KEY)
  if (!stored) throw new Error('no passkey')
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: base64urlToBuf(stored), type: 'public-key' }],
      timeout: 60000,
    },
  })
  return !!assertion
}

export function isPasskeySupported() {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}
