import { useState } from 'react'

import { getHabitLabel, getHabitStreak } from '../constants'

import { getUnlockedAchievements } from '../utils/achievements'

import GoalsCard from '../components/GoalsCard'

import QuickLog from '../components/QuickLog'

import MonthlyIntention from '../components/MonthlyIntention'

import { useLanguage } from '../i18n/LanguageContext'



export default function TrackingPage({

  profile, entries, habits, moods, intentions, reflections, reflectionKey,

  year, month, monthEntries, moodCounts,

  loggingStreak, topHabitStreak, todayEntry,

  onQuickSave, onSaveIntention, onSaveReflection, onOpenToday, onManageHabits,

  goals, monthKey, onSaveGoals, onBreathing, achievements = [],

  showQuickLog, onCloseQuickLog,

}) {

  const { t, months, lang } = useLanguage()

  const intentionKey = `${year}-${String(month + 1).padStart(2, '0')}`

  const reflection = reflections[reflectionKey] || { wentWell: '', toImprove: '' }

  const [reflForm, setReflForm] = useState(reflection)

  const unlockedBadges = getUnlockedAchievements(achievements)



  const saveReflection = () => onSaveReflection(reflForm)



  return (

    <div className="page tracking-page">

      <div className="page-header">

        <div>

          <h1 className="page-title">{t('tracking.title')}</h1>

          <p className="page-subtitle">{t('tracking.subtitle')}</p>

        </div>

        <button className="bujo-btn primary" onClick={onOpenToday}>{t('tracking.todayEntry')}</button>

      </div>



      {showQuickLog && (

        <div className="modal-overlay" onClick={onCloseQuickLog}>

          <div onClick={(e) => e.stopPropagation()}>

            <QuickLog todayEntry={todayEntry} moods={moods} onQuickSave={onQuickSave}
              onBreathing={onBreathing} forceOpen onClose={onCloseQuickLog} profile={profile} />

          </div>

        </div>

      )}



      <div className="tracking-grid">

        <div className="tracking-col">

          <QuickLog todayEntry={todayEntry} moods={moods} onQuickSave={onQuickSave} onBreathing={onBreathing} profile={profile} />

          <MonthlyIntention month={month} monthName={months[month]} intention={intentions[intentionKey]} onSave={onSaveIntention} />

          <GoalsCard goals={goals} monthKey={monthKey} habits={habits} onSave={onSaveGoals} />



          {unlockedBadges.length > 0 && (

            <div className="card achievements-card">

              <h3>{t('achievements.title')}</h3>

              <div className="badge-grid">

                {unlockedBadges.map((a) => (

                  <span key={a.id} className="badge" title={t(a.titleKey)}>{a.emoji}</span>

                ))}

              </div>

            </div>

          )}



          <div className="card">

            <h3>{t('reflection.title')} — {months[month]}</h3>

            <label className="field-label">{t('reflection.wentWell')}

              <textarea className="bujo-textarea" rows={2} value={reflForm.wentWell}

                onChange={(e) => setReflForm({ ...reflForm, wentWell: e.target.value })} />

            </label>

            <label className="field-label">{t('reflection.toImprove')}

              <textarea className="bujo-textarea" rows={2} value={reflForm.toImprove}

                onChange={(e) => setReflForm({ ...reflForm, toImprove: e.target.value })} />

            </label>

            <button className="bujo-btn small" onClick={saveReflection}>{t('reflection.save')}</button>

          </div>



          <div className="card">

            <div className="card-header-row">

              <h3>{t('tracking.habitsSection')}</h3>

              <button className="bujo-btn small ghost" onClick={onManageHabits}>{t('tracking.manageHabits')}</button>

            </div>

            <div className="habit-grid">

              {habits.map((h) => {

                const done = !!todayEntry.habits?.[h.id]

                const streak = getHabitStreak(entries, h.id)

                return (

                  <div key={h.id} className={`habit-card ${done ? 'done' : ''}`}>

                    <span className="habit-card-emoji">{h.emoji}</span>

                    <span className="habit-card-label">{getHabitLabel(h, lang)}</span>

                    {streak > 0 && <span className="habit-card-streak">{streak}🔥</span>}

                  </div>

                )

              })}

            </div>

          </div>

        </div>



        <div className="tracking-col">

          <div className="stats-row">

            <div className="stat-card"><span className="stat-card-value">{loggingStreak}</span><span className="stat-card-label">{t('tracking.dayStreak')}</span></div>

            <div className="stat-card"><span className="stat-card-value">{topHabitStreak.streak}</span><span className="stat-card-label">{t('tracking.habitStreak')}</span></div>

            <div className="stat-card"><span className="stat-card-value">{monthEntries.length}</span><span className="stat-card-label">{t('tracking.daysLogged')}</span></div>

            <div className="stat-card"><span className="stat-card-value">{monthEntries.filter(([, e]) => e.mood).length}</span><span className="stat-card-label">{t('tracking.moodsTracked')}</span></div>

          </div>



          {Object.keys(moodCounts).length > 0 ? (

            <div className="card">

              <h3>{t('tracking.moodSummary')}</h3>

              <div className="mood-chart">

                {Object.entries(moodCounts).map(([moodId, count]) => {

                  const mood = moods.find((m) => m.id === moodId)

                  if (!mood) return null

                  const total = Object.values(moodCounts).reduce((a, b) => a + b, 0)

                  return (

                    <div key={moodId} className="mood-chart-row">

                      <span className="mood-chart-emoji">{mood.emoji}</span>

                      <span className="mood-chart-label">{mood.label || t(`moods.${moodId}`)}</span>

                      <div className="mood-chart-bar-wrap">

                        <div className="mood-chart-bar" style={{ width: `${(count / total) * 100}%`, backgroundColor: mood.color }} />

                      </div>

                      <span className="mood-chart-count">{count}</span>

                    </div>

                  )

                })}

              </div>

            </div>

          ) : (

            <div className="card empty-state"><span className="empty-icon">📝</span><p>{t('tracking.noData')}</p></div>

          )}



          {profile.gender === 'female' && (

            <div className="card cycle-card"><h3>{t('tracking.cycleTracking')}</h3><p>{t('tracking.cycleHint')}</p></div>

          )}

        </div>

      </div>

    </div>

  )

}

