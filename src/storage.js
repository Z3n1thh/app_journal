import { DEFAULT_MOODS } from './constants'
import { storageSet } from './utils/db'

const PROFILE_KEY = 'bujo-profile'
const ENTRIES_KEY = 'bujo-entries'
const HABITS_KEY = 'bujo-habits'
const MOODS_KEY = 'bujo-moods'
const COLLECTIONS_KEY = 'bujo-collections'
const REFLECTIONS_KEY = 'bujo-reflections'
const THEME_KEY = 'bujo-theme'
const LANGUAGE_KEY = 'bujo-language'
const INTENTIONS_KEY = 'bujo-intentions'
const GOALS_KEY = 'bujo-goals'
const LAST_BACKUP_KEY = 'bujo-last-backup'
const TOUR_KEY = 'bujo-tour-done'
const ACCENT_KEY = 'bujo-accent'
const PROFILES_META_KEY = 'bujo-profiles-meta'
const ACHIEVEMENTS_KEY = 'bujo-achievements'
export const BACKUP_VERSION = 4

const STORAGE_KEYS = [
  PROFILE_KEY, ENTRIES_KEY, HABITS_KEY, MOODS_KEY, COLLECTIONS_KEY,
  REFLECTIONS_KEY, INTENTIONS_KEY, GOALS_KEY, LAST_BACKUP_KEY, TOUR_KEY,
  ACCENT_KEY, PROFILES_META_KEY, ACHIEVEMENTS_KEY,
]

function loadSync(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, data) {
  storageSet(key, data)
}

export async function loadAllFromStorage() {
  return {
    profile: loadProfile(),
    entries: loadEntries(),
    habits: loadHabits(),
    moods: loadMoods(),
    collections: loadCollections(),
    reflections: loadReflections(),
    intentions: loadIntentions(),
    goals: loadGoals(),
    theme: loadTheme(),
    language: loadLanguage(),
    accent: loadAccent(),
    lastBackup: loadLastBackup(),
    tourDone: loadTourDone(),
    profilesMeta: loadProfilesMeta(),
    achievements: loadAchievements(),
  }
}

export function estimateStorageUsage() {
  let bytes = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    bytes += (key?.length || 0) + (localStorage.getItem(key)?.length || 0)
  }
  const limit = 5 * 1024 * 1024
  return { bytes, limit, percent: Math.round((bytes / limit) * 100) }
}

export function loadProfile() { return loadSync(PROFILE_KEY, null) }
export function saveProfile(profile) { save(PROFILE_KEY, profile) }

export function loadEntries() { return loadSync(ENTRIES_KEY, {}) }
export function saveEntries(entries) { save(ENTRIES_KEY, entries) }

export function loadHabits() { return loadSync(HABITS_KEY, null) }
export function saveHabits(habits) { save(HABITS_KEY, habits) }

export function loadMoods() { return loadSync(MOODS_KEY, null) }
export function saveMoods(moods) { save(MOODS_KEY, moods) }

export function loadCollections() { return loadSync(COLLECTIONS_KEY, []) }
export function saveCollections(collections) { save(COLLECTIONS_KEY, collections) }

export function loadReflections() { return loadSync(REFLECTIONS_KEY, {}) }
export function saveReflections(reflections) { save(REFLECTIONS_KEY, reflections) }

export function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'light' } catch { return 'light' }
}
export function saveTheme(theme) { localStorage.setItem(THEME_KEY, theme); storageSet(THEME_KEY, theme) }

export function loadLanguage() {
  try { return localStorage.getItem(LANGUAGE_KEY) || 'en' } catch { return 'en' }
}
export function saveLanguage(lang) { localStorage.setItem(LANGUAGE_KEY, lang); storageSet(LANGUAGE_KEY, lang) }

export function loadIntentions() { return loadSync(INTENTIONS_KEY, {}) }
export function saveIntentions(intentions) { save(INTENTIONS_KEY, intentions) }

export function loadGoals() { return loadSync(GOALS_KEY, {}) }
export function saveGoals(goals) { save(GOALS_KEY, goals) }

export function loadAchievements() { return loadSync(ACHIEVEMENTS_KEY, []) }
export function saveAchievements(ids) { save(ACHIEVEMENTS_KEY, ids) }

export function loadLastBackup() {
  try { return localStorage.getItem(LAST_BACKUP_KEY) } catch { return null }
}
export function saveLastBackup(iso = new Date().toISOString()) {
  localStorage.setItem(LAST_BACKUP_KEY, iso)
  storageSet(LAST_BACKUP_KEY, iso)
}

export function loadTourDone() {
  try { return localStorage.getItem(TOUR_KEY) === '1' } catch { return false }
}
export function saveTourDone() {
  localStorage.setItem(TOUR_KEY, '1')
  storageSet(TOUR_KEY, '1')
}

export function loadAccent() {
  try { return localStorage.getItem(ACCENT_KEY) || null } catch { return null }
}
export function saveAccent(color) {
  if (color) {
    localStorage.setItem(ACCENT_KEY, color)
    storageSet(ACCENT_KEY, color)
  } else {
    localStorage.removeItem(ACCENT_KEY)
    storageSet(ACCENT_KEY, null)
  }
}

export function loadProfilesMeta() {
  return loadSync(PROFILES_META_KEY, { activeId: 'default', profiles: [{ id: 'default', name: 'Me' }] })
}
export function saveProfilesMeta(meta) { save(PROFILES_META_KEY, meta) }

export function snapshotCurrentData() {
  return getFullBackup()
}

export function loadProfileSnapshot(profileId) {
  return loadSync(`bujo-profile-data-${profileId}`, null)
}
export function saveProfileSnapshot(profileId, data) {
  save(`bujo-profile-data-${profileId}`, data)
}

export async function importBackupFile(raw, options = {}) {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (data?.encrypted) {
    throw new Error('encrypted')
  }
  return importBackup(data, options)
}

export function clearAllData() {
  STORAGE_KEYS.forEach((k) => localStorage.removeItem(k))
  STORAGE_KEYS.forEach((k) => storageSet(k, null))
}

export function getFullBackup() {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'bujo-mood-tracker',
    profile: loadProfile(),
    entries: loadEntries(),
    habits: loadHabits(),
    moods: loadMoods(),
    collections: loadCollections(),
    reflections: loadReflections(),
    theme: loadTheme(),
    language: loadLanguage(),
    intentions: loadIntentions(),
    goals: loadGoals(),
    achievements: loadAchievements(),
  }
}

export function importBackup(data, { merge = false } = {}) {
  if (!data || data.app !== 'bujo-mood-tracker') throw new Error('Invalid backup file')

  if (data.profile) {
    saveProfile(merge && loadProfile() ? { ...loadProfile(), ...data.profile } : data.profile)
  }
  if (data.entries) {
    saveEntries(merge ? { ...loadEntries(), ...data.entries } : data.entries)
  }
  if (data.habits) saveHabits(data.habits)
  if (data.moods) saveMoods(data.moods)
  if (data.collections) saveCollections(merge ? [...loadCollections(), ...data.collections] : data.collections)
  if (data.reflections) {
    saveReflections(merge ? { ...loadReflections(), ...data.reflections } : data.reflections)
  }
  if (data.theme) saveTheme(data.theme)
  if (data.language) saveLanguage(data.language)
  if (data.intentions) {
    saveIntentions(merge ? { ...loadIntentions(), ...data.intentions } : data.intentions)
  }
  if (data.goals) {
    saveGoals(merge ? { ...loadGoals(), ...data.goals } : data.goals)
  }
  if (data.achievements) saveAchievements(data.achievements)

  return {
    profile: loadProfile(),
    entries: loadEntries(),
    habits: loadHabits(),
    moods: loadMoods() || DEFAULT_MOODS,
    collections: loadCollections(),
    reflections: loadReflections(),
    theme: loadTheme(),
    language: loadLanguage(),
    intentions: loadIntentions(),
    goals: loadGoals(),
    achievements: loadAchievements(),
  }
}

export async function importBackupFromFile(file, options) {
  return importBackup(JSON.parse(await file.text()), options)
}

export async function importBackupFromClipboard(text, options) {
  return importBackup(JSON.parse(text), options)
}

export const exportBackup = getFullBackup

export function downloadBackup() {
  const blob = new Blob([JSON.stringify(getFullBackup(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bujo-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  saveLastBackup()
}

export function copyBackupToClipboard() {
  saveLastBackup()
  return navigator.clipboard.writeText(JSON.stringify(getFullBackup(), null, 2))
}
