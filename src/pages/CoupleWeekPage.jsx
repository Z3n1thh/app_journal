import { useState } from 'react'
import { getWeekDates } from '../constants'
import { loadProfileSnapshot } from '../storage'
import { useLanguage } from '../i18n/LanguageContext'

export default function CoupleWeekPage({ profilesMeta, habits, moods, entries }) {
  const { t, weekdays } = useLanguage()
  const partners = profilesMeta?.profiles?.filter((p) => p.id !== profilesMeta.activeId) || []
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '')
  const weekDates = getWeekDates()
  const partnerSnap = partnerId ? loadProfileSnapshot(partnerId) : null
  const activeProfile = profilesMeta.profiles.find((p) => p.id === profilesMeta.activeId)
  const partnerProfile = partners.find((p) => p.id === partnerId)

  if (partners.length === 0) {
    return (
      <div className="page couple-week-page">
        <div className="card empty-state"><p>{t('couple.noPartner')}</p></div>
      </div>
    )
  }

  const renderColumn = (snap, label, h, sourceEntries) => (
    <div className="couple-week-col">
      <h3>{label}</h3>
      <div className="couple-week-days">
        {weekDates.map((key, i) => {
          const entry = (sourceEntries || snap?.entries)?.[key] || {}
          const mood = moods.find((m) => m.id === entry.mood)
          return (
            <div key={key} className="couple-day-card">
              <span className="couple-day-label">{weekdays[i]}</span>
              <span className="couple-day-mood">{mood?.emoji || '—'}</span>
              <div className="couple-day-habits">
                {(h || habits).slice(0, 4).map((habit) => (
                  <span key={habit.id} className={entry.habits?.[habit.id] ? 'done' : ''}>{habit.emoji}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="page couple-week-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('couple.sharedWeek')}</h1>
          <p className="page-subtitle">{t('couple.sharedWeekHint')}</p>
        </div>
        <select className="bujo-input" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="couple-week-columns">
        {renderColumn(null, activeProfile?.name || t('couple.you'), habits, entries)}
        {renderColumn(partnerSnap, partnerProfile?.name, partnerSnap?.habits || habits)}
      </div>
    </div>
  )
}
