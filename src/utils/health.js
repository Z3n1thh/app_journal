import { isNativePlatform } from './native'
import { dateKey } from '../constants'

let healthModule = null

async function getHealth() {
  if (!isNativePlatform()) return null
  if (!healthModule) {
    try {
      healthModule = await import('@capgo/capacitor-health')
    } catch {
      return null
    }
  }
  return healthModule?.Health ?? null
}

export async function isHealthAvailable() {
  const Health = await getHealth()
  if (!Health) return { available: false, reason: 'web' }
  try {
    return await Health.isAvailable()
  } catch (err) {
    return { available: false, reason: err.message }
  }
}

export async function requestHealthAuth() {
  const Health = await getHealth()
  if (!Health) return false
  try {
    await Health.requestAuthorization({ read: ['steps', 'sleep'] })
    return true
  } catch {
    return false
  }
}

function dayBounds(key) {
  const [y, m, d] = key.split('-').map(Number)
  const start = new Date(y, m - 1, d, 0, 0, 0, 0)
  const end = new Date(y, m - 1, d, 23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

async function readStepsForDay(Health, key) {
  const { start, end } = dayBounds(key)
  try {
    const agg = await Health.queryAggregated({
      dataType: 'steps',
      startDate: start,
      endDate: end,
    })
    const total = agg?.samples?.reduce((sum, s) => sum + (s.value || 0), 0)
    return total > 0 ? Math.round(total) : null
  } catch {
    return null
  }
}

async function readSleepForDay(Health, key) {
  const { start, end } = dayBounds(key)
  try {
    const { samples } = await Health.readSamples({
      dataType: 'sleep',
      startDate: start,
      endDate: end,
    })
    if (!samples?.length) return null
    const asleepMinutes = samples
      .filter((s) => !s.sleepState || ['asleep', 'deep', 'rem', 'light'].includes(s.sleepState))
      .reduce((sum, s) => sum + (s.value || 0), 0)
    if (asleepMinutes <= 0) return null
    return Math.round((asleepMinutes / 60) * 10) / 10
  } catch {
    return null
  }
}

export async function syncHealthToEntries(entries, days = 7) {
  const Health = await getHealth()
  if (!Health) return { entries, synced: 0 }

  const { available } = await isHealthAvailable()
  if (!available) return { entries, synced: 0 }

  const next = { ...entries }
  let synced = 0
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate())

    const steps = await readStepsForDay(Health, key)
    const sleepHours = await readSleepForDay(Health, key)
    if (steps == null && sleepHours == null) continue

    const existing = next[key] || {}
    const patch = {}
    if (steps != null && (existing.steps == null || existing.healthSynced)) patch.steps = steps
    if (sleepHours != null && (existing.sleepHours == null || existing.healthSynced)) patch.sleepHours = sleepHours
    if (Object.keys(patch).length === 0) continue

    next[key] = { ...existing, ...patch, healthSynced: true }
    synced++
  }

  return { entries: next, synced }
}
