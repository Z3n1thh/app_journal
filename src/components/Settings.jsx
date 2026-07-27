import { useState, useRef } from 'react'
import {
  clearAllData, downloadBackup, importBackupFromFile,
  copyBackupToClipboard, importBackupFromClipboard, getFullBackup,
} from '../storage'
import { downloadCSV, exportPDF, exportTherapistPDF, exportMonthImage, exportMonthSpreadPDF, exportShareCard, exportYearBook } from '../utils/export'
import { parseDaylioCSV } from '../utils/import'
import { getUserLocation } from '../utils/weather'
import { THEME_PACKS, applyThemePack, getSeasonPackId } from '../utils/themes'
import { encryptBackup, decryptBackup } from '../utils/crypto'
import { pushToCloud, pullFromCloud, generateSyncId } from '../utils/sync'
import { registerPasskey, isPasskeySupported } from '../utils/passkey'
import { estimateStorageUsage } from '../storage'
import { requestNotificationPermission } from '../utils/notifications'
import { isHealthAvailable, requestHealthAuth } from '../utils/health'
import { isNativePlatform } from '../utils/native'
import { GITHUB_PAGES_URL, docsPath, isGitHubPagesHost } from '../utils/baseUrl'
import { hashPin } from '../utils/pin'
import { DEFAULT_MOODS } from '../constants'
import { useLanguage } from '../i18n/LanguageContext'

export default function Settings({
  profile, theme, accent, entries, moods, year, month, habits, profilesMeta,
  intentions, reflections, reflectionKey, moodCounts, loggingStreak,
  onUpdateProfile, onThemeChange, onAccentChange, onLanguageChange,
  onUpdateMoods, onImport, onReset, onLock, onBackup, onSwitchProfile, onAddPartner,
  onNavigateCalendar, onHealthSync,
}) {
  const { t, languages, lang, months, weekdays } = useLanguage()
  const [form, setForm] = useState({ ...profile, sync: profile?.sync || { enabled: false, url: '', key: '', syncId: generateSyncId() } })
  const [importStatus, setImportStatus] = useState('')
  const [mergeImport, setMergeImport] = useState(false)
  const [localMoods, setLocalMoods] = useState([...moods])
  const [pinSetup, setPinSetup] = useState('')
  const [encryptPwd, setEncryptPwd] = useState('')
  const [decryptPwd, setDecryptPwd] = useState('')
  const [localAccent, setLocalAccent] = useState(accent || '#8b6914')
  const [themePack, setThemePack] = useState('default')
  const [partnerName, setPartnerName] = useState('')
  const fileRef = useRef(null)
  const encFileRef = useRef(null)
  const daylioRef = useRef(null)
  const commonMeds = (form.commonMedications || []).join(', ')

  const reminders = form.reminders || { enabled: false, time: '20:00', backupReminder: false, autoExport: false }
  const healthSync = form.healthSync || { enabled: false }
  const ai = form.ai || { enabled: false, provider: 'openai', apiKey: '', model: '' }
  const sync = form.sync || { enabled: false, url: '', key: '', syncId: generateSyncId() }
  const storageUsage = estimateStorageUsage()
  const intentionKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const reflection = reflections?.[reflectionKey] || { wentWell: '', toImprove: '' }

  const handleSave = () => {
    onUpdateProfile({ ...form, sync: { ...sync, syncId: sync.syncId || generateSyncId() } })
    onUpdateMoods(localMoods)
    onAccentChange(localAccent)
  }

  const applyPack = (packId) => {
    setThemePack(packId)
    const color = applyThemePack(packId, theme)
    setLocalAccent(color)
  }

  const handleSync = async (direction) => {
    try {
      const cfg = { ...sync, syncId: sync.syncId || generateSyncId() }
      if (direction === 'push') await pushToCloud(cfg)
      else onImport(await pullFromCloud(cfg))
      setImportStatus(t('settings.syncDone'))
    } catch {
      setImportStatus(t('settings.syncFail'))
    }
  }

  const handleEncryptedImport = async (file) => {
    if (!file || decryptPwd.length < 4) return
    try {
      const payload = JSON.parse(await file.text())
      const json = await decryptBackup(payload, decryptPwd)
      onImport(await importBackupFromClipboard(json, { merge: mergeImport }))
      setImportStatus(t('settings.restored'))
    } catch {
      setImportStatus(t('settings.invalid'))
    }
  }

  const handleRegisterPasskey = async () => {
    try {
      await registerPasskey(form.name)
      setImportStatus(t('pin.passkeySet'))
    } catch { /* unsupported */ }
  }

  const handleEncryptedExport = async () => {
    if (encryptPwd.length < 4) return
    const payload = await encryptBackup(JSON.stringify(getFullBackup()), encryptPwd)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bujo-encrypted-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    onBackup?.()
    setImportStatus(t('export.encryptedDone'))
  }

  const handleReset = () => {
    if (confirm(t('settings.confirmReset'))) { clearAllData(); onReset() }
  }

  const handleSetPin = async () => {
    if (pinSetup.length >= 4) {
      setForm({ ...form, pinHash: await hashPin(pinSetup) })
      setPinSetup('')
    }
  }

  const handleRemovePin = () => setForm({ ...form, pinHash: null })

  const handleEnableReminder = async () => {
    const perm = await requestNotificationPermission()
    if (perm === 'granted' || perm === 'unsupported') {
      setForm({ ...form, reminders: { ...reminders, enabled: !reminders.enabled } })
    }
  }

  const handleEnableHealth = async () => {
    if (!isNativePlatform()) {
      setImportStatus(t('health.webOnly'))
      return
    }
    const { available } = await isHealthAvailable()
    if (!available) {
      setImportStatus(t('health.unavailable'))
      return
    }
    if (!healthSync.enabled) {
      const ok = await requestHealthAuth()
      if (!ok) { setImportStatus(t('health.denied')); return }
    }
    setForm({ ...form, healthSync: { ...healthSync, enabled: !healthSync.enabled } })
  }

  const handleSyncHealth = async () => {
    const count = await onHealthSync?.()
    setImportStatus(count > 0 ? t('health.synced', { n: count }) : t('health.noData'))
  }

  const updateMood = (id, field, value) => {
    setLocalMoods(localMoods.map((m) => m.id === id ? { ...m, [field]: value } : m))
  }

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1 className="page-title">{t('settings.title')}</h1>
        {profile.pinHash && (
          <button className="bujo-btn ghost" onClick={onLock}>{t('pin.lock')}</button>
        )}
      </div>

      <div className="settings-grid">
        <div className="card settings-card">
          <h3>{t('settings.appearance')}</h3>
          <div className="theme-toggle">
            <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => onThemeChange('light')}>☀️ {t('light')}</button>
            <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => onThemeChange('dark')}>🌙 {t('dark')}</button>
          </div>
          <label className="field-label">{t('settings.accentColor')}
            <input type="color" className="accent-picker" value={localAccent} onChange={(e) => setLocalAccent(e.target.value)} />
          </label>
          <label className="field-label">{t('settings.themePack')}
            <select className="bujo-input" value={themePack} onChange={(e) => applyPack(e.target.value)}>
              {Object.keys(THEME_PACKS).map((id) => <option key={id} value={id}>{t(`themes.${id}`)}</option>)}
            </select>
          </label>
          <label className="merge-check">
            <input type="checkbox" checked={!!form.autoSeasonTheme}
              onChange={(e) => {
                const enabled = e.target.checked
                setForm({ ...form, autoSeasonTheme: enabled })
                if (enabled) applyPack(getSeasonPackId())
              }} />
            {t('settings.autoSeasonTheme')}
          </label>
          <label className="field-label">
            {t('settings.language')}
            <select className="bujo-input" value={lang} onChange={(e) => onLanguageChange(e.target.value)}>
              {languages.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </label>
        </div>

        <div className="card settings-card">
          <h3>{t('settings.profile')}</h3>
          <label className="field-label">{t('settings.name')}
            <input className="bujo-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field-label">{t('settings.gender')}
            <select className="bujo-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="female">{t('onboarding.female')}</option>
              <option value="male">{t('onboarding.male')}</option>
              <option value="other">{t('onboarding.other')}</option>
              <option value="prefer-not">{t('onboarding.preferNot')}</option>
            </select>
          </label>
          {form.gender === 'female' && (
            <>
              <label className="field-label">{t('onboarding.lastPeriod')}
                <input type="date" className="bujo-input" value={form.lastPeriodStart || ''} onChange={(e) => setForm({ ...form, lastPeriodStart: e.target.value })} />
              </label>
              <label className="field-label">{t('onboarding.cycleLength')}
                <input type="number" min={21} max={45} className="bujo-input" value={form.cycleLength || 28} onChange={(e) => setForm({ ...form, cycleLength: Number(e.target.value) })} />
              </label>
              <label className="field-label">{t('onboarding.periodLength')}
                <input type="number" min={2} max={10} className="bujo-input" value={form.periodLength || 5} onChange={(e) => setForm({ ...form, periodLength: Number(e.target.value) })} />
              </label>
            </>
          )}
        </div>

        <div className="card settings-card">
          <h3>{t('settings.profiles')}</h3>
          {profilesMeta?.profiles?.map((p) => (
            <button key={p.id} className={`bujo-btn ${profilesMeta.activeId === p.id ? 'primary' : 'ghost'}`}
              onClick={() => onSwitchProfile?.(p.id)}>{p.name}</button>
          ))}
        </div>

        <div className="card settings-card">
          <h3>{t('couple.title')}</h3>
          <input className="bujo-input" placeholder={t('couple.partnerName')} value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
          <button className="bujo-btn" onClick={() => onAddPartner?.(partnerName)}>{t('couple.enable')}</button>
        </div>

        <div className="card settings-card">
          <h3>{t('settings.weather')}</h3>
          <label className="merge-check">
            <input type="checkbox" checked={!!form.weatherEnabled}
              onChange={(e) => setForm({ ...form, weatherEnabled: e.target.checked })} />
            {t('settings.weatherEnable')}
          </label>
          <button className="bujo-btn small" onClick={async () => {
            const loc = await getUserLocation()
            if (loc) { setForm({ ...form, location: loc }); setImportStatus(t('settings.weatherSet')) }
          }}>{t('settings.weatherLocation')}</button>
        </div>

        <div className="card settings-card">
          <h3>{t('medications.common')}</h3>
          <input className="bujo-input" placeholder={t('medications.commonHint')} value={commonMeds}
            onChange={(e) => setForm({ ...form, commonMedications: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
        </div>

        <div className="card settings-card">
          <h3>{t('settings.sync')}</h3>
          {!sync.enabled && (
            <div className="sync-guide">
              <p className="settings-hint">{t('settings.syncGuideIntro')}</p>
              <ol className="sync-steps">
                <li>{t('settings.syncStep1')}</li>
                <li>{t('settings.syncStep2')}</li>
                <li>{t('settings.syncStep3')}</li>
              </ol>
              <a className="bujo-btn ghost small" href={docsPath('SUPABASE_SETUP.md')} target="_blank" rel="noreferrer">
                {t('settings.syncGuideLink')}
              </a>
            </div>
          )}
          <label className="merge-check">
            <input type="checkbox" checked={sync.enabled} onChange={(e) => setForm({ ...form, sync: { ...sync, enabled: e.target.checked } })} />
            {t('settings.syncEnable')}
          </label>
          <label className="field-label">{t('settings.syncUrl')}
            <input className="bujo-input" value={sync.url || ''} onChange={(e) => setForm({ ...form, sync: { ...sync, url: e.target.value } })} />
          </label>
          <label className="field-label">{t('settings.syncKey')}
            <input className="bujo-input" value={sync.key || ''} onChange={(e) => setForm({ ...form, sync: { ...sync, key: e.target.value } })} />
          </label>
          <label className="field-label">{t('settings.syncId')}
            <input className="bujo-input" value={sync.syncId || ''} readOnly />
          </label>
          <div className="settings-btn-row">
            <button className="bujo-btn small" onClick={() => handleSync('push')}>{t('sync.push')}</button>
            <button className="bujo-btn small" onClick={() => handleSync('pull')}>{t('sync.pull')}</button>
          </div>
        </div>

        <div className="card settings-card">
          <h3>{t('pin.setTitle')}</h3>
          <input type="password" className="bujo-input" placeholder="4+ digits" value={pinSetup}
            onChange={(e) => setPinSetup(e.target.value)} maxLength={8} />
          <div className="settings-btn-row">
            <button className="bujo-btn" onClick={handleSetPin}>{t('pin.setTitle')}</button>
            {form.pinHash && <button className="bujo-btn danger" onClick={handleRemovePin}>{t('pin.remove')}</button>}
          </div>
          {isPasskeySupported() && (
            <button className="bujo-btn ghost" onClick={handleRegisterPasskey}>{t('pin.passkey')}</button>
          )}
        </div>

        <div className="card settings-card">
          <h3>{t('health.title')}</h3>
          <p className="settings-hint">{t('health.hint')}</p>
          <label className="merge-check">
            <input type="checkbox" checked={!!healthSync.enabled} onChange={handleEnableHealth} />
            {t('health.enable')}
          </label>
          {healthSync.enabled && (
            <button className="bujo-btn small" onClick={handleSyncHealth}>{t('health.syncNow')}</button>
          )}
          {!isNativePlatform() && <p className="settings-hint">{t('health.nativeRequired')}</p>}
        </div>

        <div className="card settings-card">
          <h3>{t('ai.title')}</h3>
          <p className="settings-hint">{t('ai.hint')}</p>
          <label className="merge-check">
            <input type="checkbox" checked={!!ai.enabled}
              onChange={(e) => setForm({ ...form, ai: { ...ai, enabled: e.target.checked } })} />
            {t('ai.enable')}
          </label>
          <label className="field-label">{t('ai.provider')}
            <select className="bujo-input" value={ai.provider || 'openai'}
              onChange={(e) => setForm({ ...form, ai: { ...ai, provider: e.target.value } })}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Claude (Anthropic)</option>
            </select>
          </label>
          <label className="field-label">{t('ai.apiKey')}
            <input type="password" className="bujo-input" value={ai.apiKey || ''} placeholder="sk-..."
              onChange={(e) => setForm({ ...form, ai: { ...ai, apiKey: e.target.value } })} />
          </label>
          <label className="field-label">{t('ai.model')}
            <input className="bujo-input" value={ai.model || ''}
              placeholder={ai.provider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini'}
              onChange={(e) => setForm({ ...form, ai: { ...ai, model: e.target.value } })} />
          </label>
        </div>

        <div className="card settings-card">
          <h3>{t('hosting.title')}</h3>
          <p className="settings-hint">{t('hosting.hint')}</p>
          {isGitHubPagesHost() && <p className="settings-hint">{t('hosting.liveNow')}</p>}
          <a className="bujo-btn" href={GITHUB_PAGES_URL} target="_blank" rel="noreferrer">
            {t('hosting.openLive')}
          </a>
          <a className="bujo-btn ghost small" href={docsPath('GITHUB_PAGES.md')} target="_blank" rel="noreferrer">
            {t('hosting.guide')}
          </a>
          <ol className="sync-steps">
            <li>{t('hosting.step1')}</li>
            <li>{t('hosting.step2')}</li>
            <li>{t('hosting.step3')}</li>
          </ol>
        </div>

        <div className="card settings-card">
          <h3>{t('native.title')}</h3>
          <p className="settings-hint">{t('native.hint')}</p>
          <a className="bujo-btn ghost small" href={docsPath('CAPACITOR_SETUP.md')} target="_blank" rel="noreferrer">
            {t('native.guide')}
          </a>
        </div>

        <div className="card settings-card">
          <h3>{t('reminders.title')}</h3>
          <label className="merge-check">
            <input type="checkbox" checked={reminders.enabled} onChange={handleEnableReminder} />
            {t('reminders.enable')}
          </label>
          <label className="field-label">{t('reminders.time')}
            <input type="time" className="bujo-input" value={reminders.time}
              onChange={(e) => setForm({ ...form, reminders: { ...reminders, time: e.target.value } })} />
          </label>
          <label className="merge-check">
            <input type="checkbox" checked={reminders.backupReminder}
              onChange={(e) => setForm({ ...form, reminders: { ...reminders, backupReminder: e.target.checked } })} />
            {t('reminders.backupReminder')}
          </label>
          <label className="merge-check">
            <input type="checkbox" checked={reminders.autoExport}
              onChange={(e) => setForm({ ...form, reminders: { ...reminders, autoExport: e.target.checked } })} />
            {t('reminders.autoExport')}
          </label>
        </div>

        {storageUsage.percent >= 80 && (
          <div className="card settings-card storage-warning">
            <p>{t('settings.storageWarning', { percent: storageUsage.percent })}</p>
          </div>
        )}

        <div className="card settings-card settings-card-wide">
          <h3>{t('moods_custom.title')}</h3>
          <div className="mood-custom-grid">
            {localMoods.map((m) => (
              <div key={m.id} className="mood-custom-row">
                <input className="bujo-input tiny" value={m.emoji} maxLength={2}
                  onChange={(e) => updateMood(m.id, 'emoji', e.target.value)} aria-label={t('moods_custom.emoji')} />
                <input className="bujo-input" value={m.label || t(`moods.${m.id}`)}
                  onChange={(e) => updateMood(m.id, 'label', e.target.value)} aria-label={t('moods_custom.label')} />
              </div>
            ))}
          </div>
          <button className="bujo-btn ghost" onClick={() => setLocalMoods([...DEFAULT_MOODS])}>{t('moods_custom.reset')}</button>
        </div>

        <div className="card settings-card">
          <h3>{t('settings.backup')}</h3>
          <p className="settings-hint">{t('settings.backupHint')}</p>
          <div className="backup-actions">
            <button className="bujo-btn" onClick={async () => {
              onNavigateCalendar?.()
              setTimeout(async () => {
                const ok = await exportMonthImage('#calendar-export', `${months[month]}-${year}.png`)
                setImportStatus(ok ? t('settings.backupDownloaded') : t('export.monthImageFail'))
              }, 400)
            }}>{t('export.monthImage')}</button>
            <button className="bujo-btn" onClick={() => exportMonthSpreadPDF({
              entries, habits, moods, profile: form, year, month, months, weekdays,
              intention: intentions?.[intentionKey], reflection, t,
            })}>{t('export.monthSpread')}</button>
            <button className="bujo-btn" onClick={() => exportShareCard({
              profile: form, monthName: months[month], year, moodCounts: moodCounts || {},
              moods: localMoods, loggingStreak: loggingStreak || 0, t,
            })}>{t('export.shareCard')}</button>
            <button className="bujo-btn" onClick={() => { downloadBackup(); onBackup?.(); setImportStatus(t('settings.backupDownloaded')) }}>{t('settings.download')}</button>
            <button className="bujo-btn" onClick={() => downloadCSV(entries, localMoods, t)}>{t('export.csv')}</button>
            <button className="bujo-btn" onClick={() => exportPDF(entries, form, months, t)}>{t('export.pdf')}</button>
            <button className="bujo-btn" onClick={() => exportTherapistPDF(entries, form, months, t, { redactNotes: false })}>{t('export.therapist')}</button>
            <button className="bujo-btn" onClick={async () => { await copyBackupToClipboard(); onBackup?.(); setImportStatus(t('settings.copied')) }}>{t('settings.copy')}</button>
            <button className="bujo-btn" onClick={() => exportYearBook({ entries, habits, moods, profile: form, year, months, t })}>{t('export.yearBook')}</button>
            <button className="bujo-btn" onClick={() => daylioRef.current?.click()}>{t('import.daylio')}</button>
            <button className="bujo-btn" onClick={() => fileRef.current?.click()}>{t('settings.importFile')}</button>
            <button className="bujo-btn" onClick={async () => {
              try {
                const restored = await importBackupFromClipboard(await navigator.clipboard.readText(), { merge: mergeImport })
                onImport(restored); setImportStatus(t('settings.restored'))
              } catch { setImportStatus(t('settings.invalid')) }
            }}>{t('settings.paste')}</button>
          </div>
          <label className="field-label">{t('export.encrypted')}
            <input type="password" className="bujo-input" placeholder={t('export.password')} value={encryptPwd}
              onChange={(e) => setEncryptPwd(e.target.value)} />
          </label>
          <button className="bujo-btn" onClick={handleEncryptedExport}>{t('export.encryptedDownload')}</button>
          <label className="field-label">{t('export.encryptedImport')}
            <input type="password" className="bujo-input" placeholder={t('export.password')} value={decryptPwd}
              onChange={(e) => setDecryptPwd(e.target.value)} />
          </label>
          <button className="bujo-btn" onClick={() => encFileRef.current?.click()}>{t('export.encryptedImport')}</button>
          <input ref={encFileRef} type="file" accept=".json" hidden onChange={(e) => {
            handleEncryptedImport(e.target.files?.[0])
            e.target.value = ''
          }} />
          <input ref={fileRef} type="file" accept=".json" hidden onChange={async (e) => {
            const file = e.target.files?.[0]; if (!file) return
            try { onImport(await importBackupFromFile(file, { merge: mergeImport })); setImportStatus(t('settings.restored')) }
            catch { setImportStatus(t('settings.invalid')) }
            e.target.value = ''
          }} />
          <input ref={daylioRef} type="file" accept=".csv" hidden onChange={async (e) => {
            const file = e.target.files?.[0]; if (!file) return
            try {
              const parsed = parseDaylioCSV(await file.text())
              onImport({ profile: form, entries: mergeImport ? { ...entries, ...parsed } : parsed, habits, moods: localMoods, collections: [], reflections: {}, intentions: {}, goals: {} })
              setImportStatus(t('import.daylioDone'))
            } catch { setImportStatus(t('settings.invalid')) }
            e.target.value = ''
          }} />
          <label className="merge-check">
            <input type="checkbox" checked={mergeImport} onChange={(e) => setMergeImport(e.target.checked)} />
            {t('settings.merge')}
          </label>
          {importStatus && <p className="import-status">{importStatus}</p>}
        </div>

        <div className="card settings-card">
          <button className="bujo-btn primary full-width" onClick={handleSave}>{t('dayModal.save')}</button>
        </div>

        <div className="card settings-card danger-zone">
          <h3>{t('settings.reset')}</h3>
          <button className="bujo-btn danger" onClick={handleReset}>{t('settings.reset')}</button>
        </div>
      </div>
    </div>
  )
}
