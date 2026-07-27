import { useState } from 'react'
import { MOOD_SCORE } from '../utils/insights'
import { getWeekDates } from '../constants'
import { loadProfileSnapshot } from '../storage'
import { useLanguage } from '../i18n/LanguageContext'

function avgMoodForWeek(entries, weekDates) {
  const scores = weekDates.map((k) => entries[k]?.mood).filter(Boolean).map((m) => MOOD_SCORE[m] || 3)
  if (!scores.length) return null
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
}

export default function CouplePage({ profilesMeta, moods, entries, onNavigateWeek }) {
  const { t } = useLanguage()
  const partners = profilesMeta?.profiles?.filter((p) => p.id !== profilesMeta.activeId) || []
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '')
  const weekDates = getWeekDates()
  const partnerSnap = partnerId ? loadProfileSnapshot(partnerId) : null
  const activeProfile = profilesMeta.profiles.find((p) => p.id === profilesMeta.activeId)

  const myAvg = entries ? avgMoodForWeek(entries, weekDates) : null
  const partnerAvg = partnerSnap?.entries ? avgMoodForWeek(partnerSnap.entries, weekDates) : null

  if (partners.length === 0) {
    return (
      <div className="page couple-page">
        <div className="page-header"><h1 className="page-title">{t('couple.usTwo')}</h1></div>
        <div className="card empty-state"><p>{t('couple.noPartner')}</p></div>
      </div>
    )
  }

  const partner = partners.find((p) => p.id === partnerId)

  return (
    <div className="page couple-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('couple.usTwo')}</h1>
          <p className="page-subtitle">{t('couple.compareHint')}</p>
        </div>
        <select className="bujo-input" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card-value">{myAvg ?? '—'}</span>
          <span className="stat-card-label">{activeProfile?.name || t('couple.you')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-value">{partnerAvg ?? '—'}</span>
          <span className="stat-card-label">{partner?.name}</span>
        </div>
      </div>

      <div className="card">
        <h3>{t('couple.weekCompare')}</h3>
        <div className="couple-week-grid">
          <div>
            <h4>{activeProfile?.name || t('couple.you')}</h4>
            <div className="week-mood-row">
              {weekDates.map((k) => {
                const mood = entries?.[k]?.mood
                const m = moods.find((x) => x.id === mood)
                return <span key={k} className="week-mood-cell" title={k}>{m?.emoji || '·'}</span>
              })}
            </div>
          </div>
          <div>
            <h4>{partner?.name}</h4>
            <div className="week-mood-row">
              {weekDates.map((k) => {
                const mood = partnerSnap?.entries?.[k]?.mood
                const m = moods.find((x) => x.id === mood)
                return <span key={k} className="week-mood-cell" title={k}>{m?.emoji || '·'}</span>
              })}
            </div>
          </div>
        </div>
        {onNavigateWeek && (
          <button className="bujo-btn small" onClick={onNavigateWeek}>{t('couple.openWeekView')}</button>
        )}
      </div>
    </div>
  )
}
