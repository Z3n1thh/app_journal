const DB_NAME = 'bujo-mood-db'
const DB_VERSION = 1
const STORE = 'kv'
const DB_TIMEOUT_MS = 3000

const LEGACY_KEYS = [
  'bujo-profile', 'bujo-entries', 'bujo-habits', 'bujo-moods',
  'bujo-collections', 'bujo-reflections', 'bujo-intentions', 'bujo-goals',
  'bujo-theme', 'bujo-language', 'bujo-last-backup', 'bujo-tour-done', 'bujo-accent',
  'bujo-achievements',
]

function withTimeout(promise, ms = DB_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('idb timeout')), ms)),
  ])
}

function openDB() {
  return withTimeout(new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('idb blocked'))
  }))
}

async function idbGet(key) {
  const db = await openDB()
  return withTimeout(new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  }))
}

async function idbSet(key, value) {
  const db = await openDB()
  return withTimeout(new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }))
}

export async function migrateLocalStorageToIDB() {
  if (!('indexedDB' in window)) return
  try {
    const done = await idbGet('__migrated__')
    if (done) return
    for (const key of LEGACY_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw != null) await idbSet(key, raw)
    }
    await idbSet('__migrated__', '1')
  } catch { /* keep using localStorage */ }
}

export async function storageGet(key, fallback = null) {
  try {
    if ('indexedDB' in window) {
      const val = await idbGet(key)
      if (val != null) return typeof fallback === 'object' && fallback !== null && !Array.isArray(fallback)
        ? JSON.parse(val) : val
    }
  } catch { /* fall through */ }
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export async function storageSet(key, data) {
  const raw = typeof data === 'string' ? data : JSON.stringify(data)
  try {
    if ('indexedDB' in window) await idbSet(key, raw)
  } catch { /* fall through */ }
  localStorage.setItem(key, raw)
}
