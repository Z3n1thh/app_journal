import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const PHASES = [
  { label: 'breatheIn', duration: 4 },
  { label: 'hold', duration: 4 },
  { label: 'breatheOut', duration: 4 },
  { label: 'hold', duration: 4 },
]

export default function BreathingTimer({ onClose }) {
  const { t } = useLanguage()
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [count, setCount] = useState(PHASES[0].duration)
  const [rounds, setRounds] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1
        setPhaseIdx((p) => {
          const next = (p + 1) % PHASES.length
          if (next === 0) setRounds((r) => r + 1)
          setCount(PHASES[next].duration)
          return next
        })
        return PHASES[(phaseIdx + 1) % PHASES.length].duration
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running, phaseIdx])

  const phase = PHASES[phaseIdx]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal breathing-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t('breathing.title')}</h2>
        <div className={`breath-circle ${running ? 'active' : ''}`}>
          <span className="breath-count">{count}</span>
          <span className="breath-label">{t(`breathing.${phase.label}`)}</span>
        </div>
        {rounds > 0 && <p className="breath-rounds">{t('breathing.rounds', { n: rounds })}</p>}
        <div className="modal-actions">
          <button className="bujo-btn" onClick={() => setRunning(!running)}>
            {running ? t('breathing.pause') : t('breathing.start')}
          </button>
          <button className="bujo-btn ghost" onClick={onClose}>{t('dayModal.close')}</button>
        </div>
      </div>
    </div>
  )
}
