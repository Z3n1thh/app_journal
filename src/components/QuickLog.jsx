import { useState } from 'react'
import { MOODS, DEFAULT_ROUTINES } from '../constants'
import { getDailyPrompt } from '../constants/prompts'
import { useLanguage } from '../i18n/LanguageContext'

export default function QuickLog({
  todayEntry, moods, onQuickSave, onBreathing, forceOpen, onClose, profile,
}) {
  const { t, lang } = useLanguage()
  const moodList = moods || MOODS
  const dailyPrompt = getDailyPrompt(lang)
  const [tab, setTab] = useState('log')
  const routines = profile?.routines || DEFAULT_ROUTINES
  const routineChecks = todayEntry.routineChecks || { morning: {}, evening: {} }

  const setMood = (moodId) => {
    onQuickSave({ ...todayEntry, mood: todayEntry.mood === moodId ? null : moodId })
  }

  const setEnergy = (energyId) => {
    onQuickSave({ ...todayEntry, energy: todayEntry.energy === energyId ? null : energyId })
  }

  const setPromptAnswer = (value) => {
    onQuickSave({ ...todayEntry, promptAnswer: value })
  }

  const toggleRoutine = (period, item) => {
    const periodChecks = { ...(routineChecks[period] || {}), [item]: !routineChecks[period]?.[item] }
    onQuickSave({ ...todayEntry, routineChecks: { ...routineChecks, [period]: periodChecks } })
  }

  if (forceOpen === false) return null

  return (
    <div className={`card quick-log ${forceOpen ? 'quick-log-modal' : ''}`}>
      {forceOpen && (
        <div className="card-header-row">
          <h3>{t('tracking.quickLog')}</h3>
          <button className="icon-btn" onClick={onClose} aria-label={t('dayModal.close')}>✕</button>
        </div>
      )}
      {!forceOpen && <h3>{t('tracking.quickLog')}</h3>}

      <div className="quick-tabs">
        <button className={`quick-tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>{t('routines.log')}</button>
        <button className={`quick-tab ${tab === 'morning' ? 'active' : ''}`} onClick={() => setTab('morning')}>🌅 {t('routines.morning')}</button>
        <button className={`quick-tab ${tab === 'evening' ? 'active' : ''}`} onClick={() => setTab('evening')}>🌙 {t('routines.evening')}</button>
      </div>

      {tab === 'log' && (
        <>
          <p className="quick-hint">{t('tracking.quickHint')}</p>
          <div className="quick-moods">
            {moodList.map((m) => (
              <button key={m.id} className={`quick-mood-btn ${todayEntry.mood === m.id ? 'selected' : ''}`}
                style={{ '--mood-color': m.color }} onClick={() => setMood(m.id)}
                title={m.label || t(`moods.${m.id}`)}>
                <span className="mood-emoji-lg">{m.emoji}</span>
              </button>
            ))}
          </div>
          <div className="quick-energy">
            <span className="quick-label">{t('tracking.energy')}</span>
            {[{ id: 'high', emoji: '⚡' }, { id: 'medium', emoji: '🔋' }, { id: 'low', emoji: '🪫' }].map((e) => (
              <button key={e.id} className={`quick-energy-btn ${todayEntry.energy === e.id ? 'selected' : ''}`}
                onClick={() => setEnergy(e.id)} title={t(`energy.${e.id}`)}>{e.emoji}</button>
            ))}
            {onBreathing && (
              <button className="bujo-btn small ghost breathe-btn" onClick={onBreathing}>{t('breathing.open')}</button>
            )}
          </div>
          <div className="journal-prompt">
            <p className="prompt-question">{t('prompts.daily')}: {dailyPrompt}</p>
            <textarea className="bujo-textarea" rows={2} placeholder={t('prompts.answerPlaceholder')}
              value={todayEntry.promptAnswer || ''} onChange={(e) => setPromptAnswer(e.target.value)} />
          </div>
        </>
      )}

      {(tab === 'morning' || tab === 'evening') && (
        <ul className="routine-checklist">
          {(routines[tab] || []).map((item) => (
            <li key={item}>
              <label className="habit-check">
                <input type="checkbox" checked={!!routineChecks[tab]?.[item]}
                  onChange={() => toggleRoutine(tab, item)} />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
