import { getFullBackup, importBackup } from '../storage'

export async function pushToCloud(syncConfig) {
  const { url, key, syncId } = syncConfig
  if (!url || !key || !syncId) throw new Error('Sync not configured')

  const backup = getFullBackup()
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/bujo_sync?on_conflict=sync_id`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      sync_id: syncId,
      data: backup,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!res.ok) throw new Error(`Sync push failed: ${res.status}`)
  return true
}

export async function pullFromCloud(syncConfig) {
  const { url, key, syncId } = syncConfig
  if (!url || !key || !syncId) throw new Error('Sync not configured')

  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/bujo_sync?sync_id=eq.${encodeURIComponent(syncId)}&select=data`

  const res = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  })

  if (!res.ok) throw new Error(`Sync pull failed: ${res.status}`)
  const rows = await res.json()
  if (!rows?.[0]?.data) throw new Error('No remote data')
  return importBackup(rows[0].data, { merge: true })
}

export function generateSyncId() {
  return crypto.randomUUID?.() || `sync-${Date.now()}`
}
