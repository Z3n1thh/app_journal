import { useState } from 'react'
import { saveProfile, saveLanguage } from '../storage'
import { LANGUAGES } from '../i18n/translations'
import { useLanguage } from '../i18n/LanguageContext'

export default function Onboarding({ onComplete }) {
  const { t, setLang, lang } = useLanguage()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [periodLength, setPeriodLength] = useState(5)
  const [lastPeriodStart, setLastPeriodStart] = useState('')

  const handleLanguage = (code) => {
    setLang(code)
    saveLanguage(code)
  }

  const handleFinish = () => {
    const profile = {
      name: name.trim() || t('friend'),
      gender,
      cycleLength: gender === 'female' ? cycleLength : null,
      periodLength: gender === 'female' ? periodLength : null,
      lastPeriodStart: gender === 'female' ? lastPeriodStart : null,
      onboarded: true,
    }
    saveProfile(profile)
    onComplete(profile)
  }

  const genderOptions = [
    { id: 'female', label: t('onboarding.female'), icon: '👩' },
    { id: 'male', label: t('onboarding.male'), icon: '👨' },
    { id: 'other', label: t('onboarding.other'), icon: '🧑' },
    { id: 'prefer-not', label: t('onboarding.preferNot'), icon: '🤐' },
  ]

  const cyclePhases = ['period', 'follicular', 'ovulation', 'luteal']

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <span className="bujo-dot" />
          <h1>{t('appName')}</h1>
          <p className="subtitle">{t('onboarding.subtitle')}</p>
        </div>

        {step === 1 && (
          <div className="onboarding-step">
            <h2>{t('onboarding.language')}</h2>
            <div className="language-grid">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  className={`language-btn ${lang === l.code ? 'selected' : ''}`}
                  onClick={() => handleLanguage(l.code)}
                >
                  <span className="lang-flag">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
            <button className="bujo-btn primary full-width" onClick={() => setStep(2)}>
              {t('onboarding.continue')} →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <h2>{t('onboarding.welcome')}</h2>
            <p>{t('onboarding.namePrompt')}</p>
            <input
              type="text"
              placeholder={t('onboarding.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bujo-input"
              autoFocus
            />
            <button className="bujo-btn primary full-width" onClick={() => setStep(3)}>
              {t('onboarding.continue')} →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <h2>{t('onboarding.aboutYou')}</h2>
            <p>{t('onboarding.genderPrompt')}</p>
            <div className="gender-options">
              {genderOptions.map((opt) => (
                <button
                  key={opt.id}
                  className={`gender-btn ${gender === opt.id ? 'selected' : ''}`}
                  onClick={() => setGender(opt.id)}
                >
                  <span className="gender-icon">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="step-nav">
              <button className="bujo-btn ghost" onClick={() => setStep(2)}>← {t('onboarding.back')}</button>
              <button
                className="bujo-btn primary"
                disabled={!gender}
                onClick={() => gender === 'female' ? setStep(4) : handleFinish()}
              >
                {gender === 'female' ? `${t('onboarding.continue')} →` : `${t('onboarding.startTracking')} →`}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step">
            <h2>{t('onboarding.cycleTitle')}</h2>
            <p>{t('onboarding.cycleDesc')}</p>

            <label className="field-label">
              {t('onboarding.lastPeriod')}
              <input type="date" value={lastPeriodStart} onChange={(e) => setLastPeriodStart(e.target.value)} className="bujo-input" />
            </label>
            <label className="field-label">
              {t('onboarding.cycleLength')}
              <input type="number" min={21} max={45} value={cycleLength} onChange={(e) => setCycleLength(Number(e.target.value))} className="bujo-input" />
            </label>
            <label className="field-label">
              {t('onboarding.periodLength')}
              <input type="number" min={2} max={10} value={periodLength} onChange={(e) => setPeriodLength(Number(e.target.value))} className="bujo-input" />
            </label>

            <div className="cycle-preview">
              <span className="preview-label">{t('onboarding.cycleIncludes')}</span>
              <div className="preview-items">
                {cyclePhases.map((phase) => (
                  <span key={phase} className="preview-tag">{t(`cycle.${phase}`)}</span>
                ))}
              </div>
            </div>

            <div className="step-nav">
              <button className="bujo-btn ghost" onClick={() => setStep(3)}>← {t('onboarding.back')}</button>
              <button className="bujo-btn ghost" onClick={handleFinish}>{t('onboarding.skipCycle')}</button>
              <button className="bujo-btn primary" onClick={handleFinish}>
                {t('onboarding.startTracking')} →
              </button>
            </div>
          </div>
        )}

        <div className="onboarding-dots">
          {[1, 2, 3, 4].map((s) => (
            <span key={s} className={`step-dot ${step >= s ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
