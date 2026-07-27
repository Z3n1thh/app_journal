import { useState, useEffect, useCallback, useRef } from 'react'
import SideNav from './components/SideNav'
import BottomNav from './components/BottomNav'
import Onboarding from './components/Onboarding'
import PinGate from './components/PinGate'
import CalendarPage from './pages/CalendarPage'
import WeeklyPage from './pages/WeeklyPage'
import TrackingPage from './pages/TrackingPage'
import InsightsPage from './pages/InsightsPage'
import SearchPage from './pages/SearchPage'
import CollectionsPage from './pages/CollectionsPage'
import CouplePage from './pages/CouplePage'
import CoupleWeekPage from './pages/CoupleWeekPage'
import Settings from './components/Settings'
import DayModal from './components/DayModal'
import HabitManager from './components/HabitManager'
import Toast from './components/Toast'
import InstallPrompt from './components/InstallPrompt'
import OnboardingTour from './components/OnboardingTour'
import BreathingTimer from './components/BreathingTimer'
import BackupBanner from './components/BackupBanner'
import {
  DEFAULT_HABITS, DEFAULT_MOODS, emptyDayEntry, todayKey, prevDayKey,
  getLoggingStreak, getHabitStreak, getWeekDates,
} from './constants'
import {
  loadProfile, saveProfile, loadEntries, saveEntries,
  loadHabits, saveHabits, loadMoods, saveMoods,
  loadCollections, saveCollections, loadReflections, saveReflections,
  loadTheme, saveTheme, loadIntentions, saveIntentions,
  loadLanguage, saveLanguage, loadGoals, saveGoals,
  loadLastBackup, loadTourDone, saveTourDone, loadAccent, saveAccent,
  downloadBackup, loadProfilesMeta, saveProfilesMeta, snapshotCurrentData,
  saveProfileSnapshot, loadProfileSnapshot, loadAllFromStorage,
  loadAchievements, saveAchievements,
} from './storage'
import { pushToCloud } from './utils/sync'
import { migrateLocalStorageToIDB } from './utils/db'
import { initNativeApp } from './utils/native'
import { syncHealthToEntries } from './utils/health'
import { scheduleReminder, scheduleHabitReminders, showNotification } from './utils/notifications'
import { checkAchievements } from './utils/achievements'
import { fetchWeatherForDate, getUserLocation } from './utils/weather'
import { getSeasonPackId, applyThemePack } from './utils/themes'
import { useLanguage } from './i18n/LanguageContext'

const STREAK_MILESTONES = [7, 14, 30, 100]

function applyTheme(theme, accent) {
  document.documentElement.setAttribute('data-theme', theme)
  if (accent) document.documentElement.style.setProperty('--accent', accent)
  else document.documentElement.style.removeProperty('--accent')
}

function AppContent() {
  const { t, setLang, lang, months } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [entries, setEntries] = useState({})
  const [habits, setHabits] = useState(DEFAULT_HABITS)
  const [moods, setMoods] = useState(DEFAULT_MOODS)
  const [collections, setCollections] = useState([])
  const [reflections, setReflections] = useState({})
  const [intentions, setIntentions] = useState({})
  const [goals, setGoals] = useState({})
  const [theme, setTheme] = useState('light')
  const [accent, setAccent] = useState(null)
  const [ready, setReady] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [page, setPage] = useState('calendar')
  const [showTour, setShowTour] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [toast, setToast] = useState(null)
  const undoRef = useRef(null)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const [selectedDay, setSelectedDay] = useState(null)
  const [showHabits, setShowHabits] = useState(false)
  const [lastBackup, setLastBackup] = useState(null)
  const [profilesMeta, setProfilesMeta] = useState({ activeId: 'default', profiles: [{ id: 'default', name: 'Me' }] })
  const [achievements, setAchievements] = useState([])
  const [showQuickLog, setShowQuickLog] = useState(false)

  useEffect(() => {
    migrateLocalStorageToIDB()
      .then(() => loadAllFromStorage())
      .then((data) => {
        setProfile(data.profile)
        setEntries(data.entries)
        if (data.habits) setHabits(data.habits)
        if (data.moods) setMoods(data.moods)
        setCollections(data.collections)
        setReflections(data.reflections)
        setIntentions(data.intentions)
        setGoals(data.goals)
        setAchievements(data.achievements || [])
        setTheme(data.theme || 'light')
        setAccent(data.accent)
        applyTheme(data.theme || 'light', data.accent)
        setLang(data.language || 'en')
        setLastBackup(data.lastBackup)
        setProfilesMeta(data.profilesMeta)
        setUnlocked(!data.profile?.pinHash)
        if (data.profile?.onboarded && !data.tourDone) setShowTour(true)
        if (data.profile?.autoSeasonTheme) {
          const pack = getSeasonPackId()
          const color = applyThemePack(pack, data.theme || 'light')
          setAccent(color)
          saveAccent(color)
        }
        initNativeApp()
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [setLang])

  useEffect(() => {
    if (!ready || !profile?.healthSync?.enabled) return
    syncHealthToEntries(entries).then(({ entries: synced, synced: count }) => {
      if (count > 0) { setEntries(synced); saveEntries(synced) }
    })
  }, [ready, profile?.healthSync?.enabled])

  useEffect(() => {
    const p = loadProfile()
    if (!p?.reminders?.enabled) return
    const timer = scheduleReminder(
      { ...p.reminders, body: t('logToday') },
      () => showNotification(t('appName'), t('logToday')),
    )
    return () => { if (timer) clearTimeout(timer) }
  }, [profile?.reminders, t])

  useEffect(() => {
    const p = loadProfile()
    if (!p?.reminders?.backupReminder) return
    const days = lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000) : 999
    if (days >= 7) showNotification(t('appName'), t('backup.overdue', { days: days === 999 ? '∞' : days }))
  }, [profile?.reminders?.backupReminder, lastBackup, t])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('action') === 'log') setSelectedDay(todayKey())
    if (params.get('action') === 'quicklog') { setPage('tracking'); setShowQuickLog(true) }
    if (params.get('page')) setPage(params.get('page'))
  }, [])

  useEffect(() => {
    if (!ready) return
    scheduleHabitReminders(habits, t)
  }, [ready, habits, t])

  const checkAndUnlockAchievements = useCallback((updatedEntries) => {
    const prevStreak = getLoggingStreak(entries)
    const newStreak = getLoggingStreak(updatedEntries)
    if (newStreak > prevStreak && STREAK_MILESTONES.includes(newStreak)) {
      showNotification(t('appName'), t('streak.milestone', { n: newStreak }))
    }
    const { unlocked, newlyUnlocked } = checkAchievements(updatedEntries, habits, achievements)
    if (newlyUnlocked.length > 0) {
      saveAchievements(unlocked)
      setAchievements(unlocked)
      const ach = newlyUnlocked[0]
      setToast({ message: `${ach.emoji} ${t(ach.titleKey)}`, action: null })
    }
  }, [habits, achievements, entries, t])

  const intentionKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const reflectionKey = intentionKey
  const monthKey = intentionKey

  const handleThemeChange = (newTheme) => { setTheme(newTheme); saveTheme(newTheme); applyTheme(newTheme, accent) }
  const handleAccentChange = (color) => { setAccent(color); saveAccent(color); applyTheme(theme, color) }
  const handleLanguageChange = (code) => { setLang(code); saveLanguage(code) }

  useEffect(() => {
    const p = loadProfile()
    if (!p?.reminders?.autoExport) return
    const days = lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000) : 999
    if (days >= 7) {
      downloadBackup()
      setLastBackup(loadLastBackup())
    }
  }, [profile?.reminders?.autoExport, lastBackup])

  const syncGoalsFromHabits = (data) => {
    const monthGoals = goals[monthKey] || []
    if (!monthGoals.length) return goals
    let changed = false
    const updatedGoals = monthGoals.map((g) => {
      if (!g.habitId || !data.habits?.[g.habitId]) return g
      if (g.progress >= g.target) return g
      changed = true
      return { ...g, progress: Math.min(g.target, g.progress + 1) }
    })
    if (!changed) return goals
    const next = { ...goals, [monthKey]: updatedGoals }
    saveGoals(next)
    return next
  }

  const handleSaveDay = async (dateKey, data) => {
    let entry = { ...data }
    try {
      let loc = profile?.location
      if (!loc && profile?.weatherEnabled) {
        loc = await getUserLocation()
        if (loc) {
          const updatedProfile = { ...profile, location: loc }
          setProfile(updatedProfile)
          saveProfile(updatedProfile)
        }
      }
      if (loc && profile?.weatherEnabled) {
        const weather = await fetchWeatherForDate(loc.lat, loc.lon, dateKey)
        if (weather) entry = { ...entry, weather }
      }
    } catch { /* weather optional */ }
    const updated = { ...entries, [dateKey]: entry }
    setEntries(updated); saveEntries(updated)
    setGoals(syncGoalsFromHabits(entry))
    checkAndUnlockAchievements(updated)
    setSelectedDay(null)
    if (profile?.sync?.enabled) {
      pushToCloud(profile.sync).catch(() => {})
    }
  }

  const handleDeleteDay = (k) => {
    const removed = entries[k]
    undoRef.current = { key: k, data: removed }
    const u = { ...entries }; delete u[k]
    setEntries(u); saveEntries(u); setSelectedDay(null)
    setToast({ message: t('undo.deleted'), action: t('undo.undo') })
  }

  const handleUndo = () => {
    if (!undoRef.current) return
    const { key, data } = undoRef.current
    const u = { ...entries, [key]: data }
    setEntries(u); saveEntries(u)
    undoRef.current = null
    setToast(null)
  }

  const handleQuickSave = (data) => {
    const key = todayKey()
    const updated = { ...entries, [key]: data }
    setEntries(updated); saveEntries(updated)
    setGoals(syncGoalsFromHabits(data))
    checkAndUnlockAchievements(updated)
  }

  const handleCopyWeek = (updates) => {
    const updated = { ...entries, ...updates }
    setEntries(updated); saveEntries(updated)
    setToast({ message: t('week.copied') })
  }

  const handleSaveWeeklyReflection = (weekKey, data) => {
    const key = `week:${weekKey}`
    const u = { ...reflections, [key]: data }
    setReflections(u); saveReflections(u)
  }

  const handleNavigate = (p) => {
    if (p === 'more') setPage('more')
    else setPage(p)
  }

  const handleSwitchProfile = (profileId) => {
    const meta = loadProfilesMeta()
    saveProfileSnapshot(meta.activeId, snapshotCurrentData())
    const snap = loadProfileSnapshot(profileId)
    if (snap) handleImport({ ...snap, profile: snap.profile || loadProfile() })
    const nextMeta = { ...meta, activeId: profileId }
    saveProfilesMeta(nextMeta)
    setProfilesMeta(nextMeta)
  }

  const handleAddPartner = (name) => {
    const meta = loadProfilesMeta()
    const id = `profile-${Date.now()}`
    saveProfileSnapshot(meta.activeId, snapshotCurrentData())
    const nextMeta = {
      activeId: id,
      profiles: [...meta.profiles, { id, name: name || t('couple.partnerName') }],
    }
    saveProfilesMeta(nextMeta)
    setProfilesMeta(nextMeta)
    handleImport({
      profile: { ...loadProfile(), name: name || t('couple.partnerName'), onboarded: true },
      entries: {}, habits: DEFAULT_HABITS, moods: DEFAULT_MOODS, collections: [],
      reflections: {}, intentions: {}, goals: {},
    })
  }
  const handleImport = (restored) => {
    setProfile(restored.profile); setEntries(restored.entries)
    if (restored.habits) setHabits(restored.habits)
    if (restored.moods) setMoods(restored.moods)
    if (restored.collections) setCollections(restored.collections)
    if (restored.reflections) setReflections(restored.reflections)
    if (restored.intentions) setIntentions(restored.intentions)
    if (restored.goals) setGoals(restored.goals)
    if (restored.achievements) { setAchievements(restored.achievements); saveAchievements(restored.achievements) }
    if (restored.theme) handleThemeChange(restored.theme)
    if (restored.language) handleLanguageChange(restored.language)
    setUnlocked(!restored.profile?.pinHash)
  }

  const shiftMonth = useCallback((dir) => {
    setMonth((m) => {
      if (dir < 0 && m === 0) { setYear((y) => y - 1); return 11 }
      if (dir > 0 && m === 11) { setYear((y) => y + 1); return 0 }
      return m + dir
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches('input, textarea, select')) return
      if (e.key === '/' && !e.ctrlKey) { e.preventDefault(); setPage('search') }
      if (e.key === 'n' || e.key === 'N') { setSelectedDay(todayKey()) }
      if (e.key === 'ArrowLeft') shiftMonth(-1)
      if (e.key === 'ArrowRight') shiftMonth(1)
      if (e.key === '?') setShowTour(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shiftMonth])

  if (!ready) {
    return (
      <div className="app-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading…</p>
      </div>
    )
  }
  if (!profile?.onboarded) return <Onboarding onComplete={(p) => { setProfile(p); saveProfile(p); saveHabits(DEFAULT_HABITS); setUnlocked(true); setShowTour(true) }} />

  if (profile.pinHash && !unlocked) {
    return <PinGate pinHash={profile.pinHash} onUnlock={() => setUnlocked(true)} />
  }

  const monthEntries = Object.entries(entries).filter(([key]) => {
    const [y, m] = key.split('-').map(Number)
    return y === year && m === month + 1
  })
  const moodCounts = monthEntries.reduce((acc, [, e]) => {
    if (e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1; return acc
  }, {})
  const loggingStreak = getLoggingStreak(entries)
  const todayEntry = { ...emptyDayEntry(), ...entries[todayKey()] }
  const topHabitStreak = habits.reduce((best, h) => {
    const s = getHabitStreak(entries, h.id)
    return s > best.streak ? { habit: h, streak: s } : best
  }, { habit: null, streak: 0 })

  const locales = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', nl: 'nl-NL', sv: 'sv-SE' }
  const locale = locales[lang] || lang
  const weekDates = getWeekDates()
  const currentWeekKey = weekDates[0]

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">{t('a11y.skipNav')}</a>
      <SideNav page={page} onNavigate={setPage} theme={theme} profilesMeta={profilesMeta}
        onToggleTheme={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')} />
      <BottomNav page={page} onNavigate={handleNavigate} />

      <div className="app-body">
        <InstallPrompt />
        <BackupBanner lastBackup={lastBackup} onBackup={() => { downloadBackup(); setLastBackup(loadLastBackup()) }} />

        <header className="top-bar">
          <div>
            <h1 className="top-bar-greeting">{t('greeting', { name: profile.name })}</h1>
            <p className="top-bar-date">
              {new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        <main id="main-content" className="main-content" tabIndex={-1}>
          {page === 'calendar' && (
            <CalendarPage year={year} month={month} entries={entries} habits={habits} moods={moods} profile={profile}
              onDayClick={setSelectedDay} onMonthChange={(y, m) => { setYear(y); setMonth(m) }} />
          )}
          {page === 'week' && (
            <WeeklyPage entries={entries} habits={habits} moods={moods} onDayClick={setSelectedDay}
              onCopyWeek={handleCopyWeek}
              weeklyReflection={reflections[`week:${currentWeekKey}`]}
              onSaveWeeklyReflection={handleSaveWeeklyReflection} />
          )}
          {page === 'tracking' && (
            <TrackingPage profile={profile} entries={entries} habits={habits} moods={moods} intentions={intentions}
              reflections={reflections} reflectionKey={reflectionKey}
              year={year} month={month} monthEntries={monthEntries} moodCounts={moodCounts}
              loggingStreak={loggingStreak} topHabitStreak={topHabitStreak} todayEntry={todayEntry}
              goals={goals} monthKey={monthKey} achievements={achievements}
              showQuickLog={showQuickLog} onCloseQuickLog={() => setShowQuickLog(false)}
              onQuickSave={handleQuickSave} onSaveIntention={(text) => {
                const u = { ...intentions, [intentionKey]: text }; setIntentions(u); saveIntentions(u)
              }}
              onSaveReflection={(data) => {
                const u = { ...reflections, [reflectionKey]: data }; setReflections(u); saveReflections(u)
              }}
              onSaveGoals={(g) => { setGoals(g); saveGoals(g) }}
              onBreathing={() => setShowBreathing(true)}
              onOpenToday={() => setSelectedDay(todayKey())} onManageHabits={() => setShowHabits(true)} />
          )}
          {page === 'couple' && (
            <CouplePage profilesMeta={profilesMeta} moods={moods} entries={entries}
              onNavigateWeek={() => setPage('couple-week')} />
          )}
          {page === 'couple-week' && (
            <CoupleWeekPage profilesMeta={profilesMeta} habits={habits} moods={moods} entries={entries} />
          )}
          {page === 'insights' && (
            <InsightsPage entries={entries} habits={habits} moods={moods} profile={profile}
              year={year} month={month}
              onMonthChange={(y, m) => { setYear(y); setMonth(m) }} />
          )}
          {page === 'more' && (
            <MobileMorePage onNavigate={setPage} />
          )}
          {page === 'collections' && (
            <CollectionsPage collections={collections} onUpdate={(c) => { setCollections(c); saveCollections(c) }} />
          )}
          {page === 'search' && (
            <SearchPage entries={entries} moods={moods} onDayClick={setSelectedDay} />
          )}
          {page === 'settings' && (
            <Settings profile={profile} theme={theme} accent={accent} entries={entries} moods={moods}
              year={year} month={month} habits={habits} intentions={intentions} reflections={reflections}
              reflectionKey={reflectionKey} moodCounts={moodCounts} loggingStreak={loggingStreak}
              onNavigateCalendar={() => setPage('calendar')}
              profilesMeta={profilesMeta}
              onUpdateProfile={(p) => { setProfile(p); saveProfile(p) }}
              onUpdateMoods={(m) => { setMoods(m); saveMoods(m) }}
              onThemeChange={handleThemeChange} onAccentChange={handleAccentChange}
              onLanguageChange={handleLanguageChange}
              onImport={handleImport}
              onBackup={() => { downloadBackup(); setLastBackup(loadLastBackup()) }}
              onSwitchProfile={handleSwitchProfile}
              onAddPartner={handleAddPartner}
              onHealthSync={async () => {
                const { entries: synced, synced: count } = await syncHealthToEntries(entries)
                setEntries(synced); saveEntries(synced)
                return count
              }}
              onReset={() => {
                setProfile(null); setEntries({}); setHabits(DEFAULT_HABITS); setMoods(DEFAULT_MOODS)
                setCollections([]); setReflections({}); setIntentions({}); setGoals({}); setPage('calendar'); setUnlocked(true)
              }}
              onLock={() => setUnlocked(false)} />
          )}
        </main>
      </div>

      {selectedDay && (
        <DayModal dateKey={selectedDay} entry={entries[selectedDay] || emptyDayEntry()}
          yesterdayEntry={entries[prevDayKey(selectedDay)]}
          habits={habits} moods={moods} showCycle={profile.gender === 'female'}
          commonMedications={profile.commonMedications || []}
          onSave={handleSaveDay} onDelete={handleDeleteDay} onClose={() => setSelectedDay(null)} />
      )}

      {showHabits && (
        <HabitManager habits={habits} onUpdate={(h) => { setHabits(h); saveHabits(h) }} onClose={() => setShowHabits(false)} />
      )}

      {showBreathing && <BreathingTimer onClose={() => setShowBreathing(false)} />}
      {showTour && <OnboardingTour onDone={() => { setShowTour(false); saveTourDone() }} />}

      <Toast message={toast?.message} action={toast?.action} onAction={handleUndo} onDismiss={() => setToast(null)} />
    </div>
  )
}

export default function App() { return <AppContent /> }
