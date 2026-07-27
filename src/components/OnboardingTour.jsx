import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const STEPS = [
  { key: 'calendar', icon: '📅' },
  { key: 'week', icon: '📆' },
  { key: 'tracking', icon: '✏️' },
  { key: 'insights', icon: '📊' },
]

export default function OnboardingTour({ onDone }) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true">
      <div className="tour-card">
        <span className="tour-icon">{current.icon}</span>
        <h2>{t(`tour.${current.key}Title`)}</h2>
        <p>{t(`tour.${current.key}Desc`)}</p>
        <div className="tour-actions">
          <button className="bujo-btn ghost" onClick={onDone}>{t('tour.skip')}</button>
          {step < STEPS.length - 1 ? (
            <button className="bujo-btn primary" onClick={() => setStep(step + 1)}>{t('onboarding.continue')}</button>
          ) : (
            <button className="bujo-btn primary" onClick={onDone}>{t('tour.done')}</button>
          )}
        </div>
      </div>
    </div>
  )
}
