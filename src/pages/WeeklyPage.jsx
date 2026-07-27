import { useState } from 'react'
import { getWeekDates, parseDateKey, emptyDayEntry } from '../constants'
import { useLanguage } from '../i18n/LanguageContext'

export default function WeeklyPage({ entries, habits, moods, onDayClick, onCopyWeek, weeklyReflection, onSaveWeeklyReflection }) {
  const { t, weekdays } = useLanguage()
  const [weekStart, setWeekStart] = useState(() => {
    const dates = getWeekDates()
    return parseDateKey(dates[0])
  })
  const [refl, setRefl] = useState(weeklyReflection || { wentWell: '', toImprove: '' })

  const startDate = new Date(weekStart.year, weekStart.month, weekStart.day)
  const dates = getWeekDates(startDate)
  const weekKey = dates[0]

  const shiftWeek = (dir) => {
    const d = new Date(weekStart.year, weekStart.month, weekStart.day + dir * 7)
    setWeekStart({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })
  }

  const copyLastWeek = () => {
    const prevStart = new Date(weekStart.year, weekStart.month, weekStart.day - 7)
    const prevDates = getWeekDates(prevStart)
    const updates = {}
    dates.forEach((key, i) => {
      const prev = entries[prevDates[i]]
      if (!prev || entries[key]?.mood) return
      updates[key] = {
        ...emptyDayEntry(),
        habits: { ...prev.habits },
        tags: [...(prev.tags || [])],
        priorities: [...(prev.priorities || ['', '', ''])],
      }
    })
    if (Object.keys(updates).length) onCopyWeek(updates)
  }

  return (
    <div className="page weekly-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('week.title')}</h1>
          <p className="page-subtitle">{t('week.subtitle')}</p>
        </div>
        <div className="week-nav">
          <button className="bujo-btn ghost" onClick={copyLastWeek}>{t('week.copyLast')}</button>
          <button className="bujo-btn ghost" onClick={() => shiftWeek(-1)} aria-label={t('week.prev')}>‹</button>
          <button className="bujo-btn ghost" onClick={() => shiftWeek(1)} aria-label={t('week.next')}>›</button>
        </div>
      </div>

      <div className="weekly-grid">
        {dates.map((key, i) => {
          const { day } = parseDateKey(key)
          const entry = { ...emptyDayEntry(), ...entries[key] }
          const mood = moods.find((m) => m.id === entry.mood)
          const done = habits.filter((h) => entry.habits?.[h.id]).length

          return (
            <button key={key} className="weekly-day card" onClick={() => onDayClick(key)}>
              <span className="weekly-weekday">{weekdays[i]}</span>
              <span className="weekly-date">{day}</span>
              <span className="weekly-mood">{mood?.emoji || '·'}</span>
              {entry.energy && <span className="weekly-energy">{entry.energy === 'high' ? '⚡' : entry.energy === 'medium' ? '🔋' : '🪫'}</span>}
              <div className="weekly-habits">
                {habits.map((h) => (
                  <span key={h.id} className={`weekly-habit-dot ${entry.habits?.[h.id] ? 'done' : ''}`} title={h.emoji}>
                    {entry.habits?.[h.id] ? h.emoji : '○'}
                  </span>
                ))}
              </div>
              {entry.gratitude && <p className="weekly-gratitude">{entry.gratitude}</p>}
              <span className="weekly-habit-count">{done}/{habits.length} {t('week.habits')}</span>
            </button>
          )
        })}
      </div>

      <div className="card weekly-reflection">
        <h3>{t('week.reflectionTitle')}</h3>
        <label className="field-label">{t('reflection.wentWell')}
          <textarea className="bujo-textarea" rows={2} value={refl.wentWell}
            onChange={(e) => setRefl({ ...refl, wentWell: e.target.value })} />
        </label>
        <label className="field-label">{t('reflection.toImprove')}
          <textarea className="bujo-textarea" rows={2} value={refl.toImprove}
            onChange={(e) => setRefl({ ...refl, toImprove: e.target.value })} />
        </label>
        <button className="bujo-btn small" onClick={() => onSaveWeeklyReflection(weekKey, refl)}>{t('reflection.save')}</button>
      </div>
    </div>
  )
}
