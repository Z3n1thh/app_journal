import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export default function MonthlyIntention({ monthName, intention, onSave }) {
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(intention || '')

  const handleSave = () => {
    onSave(text.trim())
    setEditing(false)
  }

  return (
    <div className="card monthly-intention">
      <div className="intention-header">
        <h3>{t('tracking.monthlyFocus', { month: monthName })}</h3>
        {!editing && (
          <button className="bujo-btn small ghost" onClick={() => { setText(intention || ''); setEditing(true) }}>
            {intention ? t('tracking.edit') : t('tracking.set')}
          </button>
        )}
      </div>

      {editing ? (
        <>
          <input
            className="bujo-input"
            placeholder={t('tracking.setFocus')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <div className="intention-actions">
            <button className="bujo-btn small ghost" onClick={() => setEditing(false)}>{t('tracking.cancel')}</button>
            <button className="bujo-btn small primary" onClick={handleSave}>{t('tracking.save')}</button>
          </div>
        </>
      ) : (
        <p className="intention-text">
          {intention || t('tracking.setFocus')}
        </p>
      )}
    </div>
  )
}
