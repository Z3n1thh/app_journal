import { useState, useRef } from 'react'
import {
  CYCLE_PHASES, ENERGY_LEVELS, QUICK_TAGS,
  emptyDayEntry, formatDisplayDate, getHabitLabel,
} from '../constants'
import { getDailyPrompt } from '../constants/prompts'
import { useLanguage } from '../i18n/LanguageContext'
import { compressImage } from '../utils/themes'

export default function DayModal({
  dateKey: dayKey, entry, habits, moods, showCycle,
  yesterdayEntry, commonMedications = [], onSave, onDelete, onClose,
}) {
  const { t, months, lang } = useLanguage()
  const [form, setForm] = useState({ ...emptyDayEntry(), ...entry })
  const [newTag, setNewTag] = useState('')
  const [newMed, setNewMed] = useState('')
  const [recording, setRecording] = useState(false)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const toggleHabit = (habitId) => {
    setForm((prev) => ({
      ...prev,
      habits: { ...prev.habits, [habitId]: !prev.habits[habitId] },
    }))
  }

  const addTag = (tag) => {
    const tagId = tag || newTag.trim()
    if (tagId && !form.tags.includes(tagId)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tagId] }))
      setNewTag('')
    }
  }

  const copyYesterday = () => {
    if (!yesterdayEntry) return
    const { mood, energy, habits: h, tags, priorities } = yesterdayEntry
    setForm((prev) => ({
      ...prev,
      mood: mood ?? prev.mood,
      energy: energy ?? prev.energy,
      habits: { ...h },
      tags: [...(tags || [])],
      priorities: [...(priorities || ['', '', ''])],
    }))
  }

  const handleSave = () => onSave(dayKey, form)
  const handleDelete = () => { if (confirm(t('dayModal.confirmClear'))) onDelete(dayKey) }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => update('voiceNote', reader.result)
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((tr) => tr.stop())
      }
      mediaRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch { /* mic denied */ }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const addMedication = (name) => {
    const med = (name || newMed).trim()
    if (!med || form.medications?.includes(med)) return
    setForm((prev) => ({ ...prev, medications: [...(prev.medications || []), med] }))
    setNewMed('')
  }

  const removeMedication = (med) => {
    setForm((prev) => ({ ...prev, medications: (prev.medications || []).filter((m) => m !== med) }))
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="day-modal-title">
      <div className="modal day-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="day-modal-title">{formatDisplayDate(dayKey, months)}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t('dayModal.close')}>✕</button>
        </div>

        {yesterdayEntry && (
          <button className="bujo-btn ghost copy-yesterday" onClick={copyYesterday}>
            ↩ {t('dayModal.copyYesterday')}
          </button>
        )}

        <section className="modal-section">
          <h3>{t('dayModal.mood')}</h3>
          <div className="mood-picker">
            {moods.map((m) => (
              <button
                key={m.id}
                className={`mood-btn ${form.mood === m.id ? 'selected' : ''}`}
                style={{ '--mood-color': m.color }}
                onClick={() => update('mood', form.mood === m.id ? null : m.id)}
                aria-label={m.label || t(`moods.${m.id}`)}
              >
                <span className="mood-emoji-lg">{m.emoji}</span>
                <span className="mood-label">{m.label || t(`moods.${m.id}`)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <h3>{t('dayModal.energy')}</h3>
          <div className="energy-picker">
            {ENERGY_LEVELS.map((e) => (
              <button key={e.id} className={`energy-btn ${form.energy === e.id ? 'selected' : ''}`}
                onClick={() => update('energy', form.energy === e.id ? null : e.id)}>
                <span className="energy-emoji">{e.emoji}</span>
                <span>{t(`energy.${e.id}`)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="modal-section number-inputs">
          <label className="field-label">
            {t('dayModal.sleep')}
            <input type="number" min={0} max={24} step={0.5} className="bujo-input"
              value={form.sleepHours ?? ''} onChange={(e) => update('sleepHours', e.target.value ? Number(e.target.value) : null)} />
          </label>
          <label className="field-label">
            {t('dayModal.water')}
            <input type="number" min={0} max={20} className="bujo-input"
              value={form.waterGlasses ?? ''} onChange={(e) => update('waterGlasses', e.target.value ? Number(e.target.value) : null)} />
          </label>
        </section>

        {showCycle && (
          <section className="modal-section">
            <h3>{t('dayModal.cyclePhase')}</h3>
            <div className="cycle-picker">
              {CYCLE_PHASES.map((p) => (
                <button key={p.id} className={`cycle-btn ${form.cyclePhase === p.id ? 'selected' : ''}`}
                  style={{ '--cycle-color': p.color }}
                  onClick={() => update('cyclePhase', form.cyclePhase === p.id ? null : p.id)}>
                  <span>{p.emoji}</span><span>{t(`cycle.${p.id}`)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="modal-section">
          <h3>{t('dayModal.priorities')}</h3>
          <div className="priority-list">
            {form.priorities.map((p, i) => (
              <div key={i} className="priority-row">
                <span className="priority-bullet">•</span>
                <input className="bujo-input priority-input" placeholder={t('dayModal.priority', { n: i + 1 })}
                  value={p} onChange={(e) => {
                    const priorities = [...form.priorities]; priorities[i] = e.target.value
                    update('priorities', priorities)
                  }} />
              </div>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <h3>{t('dayModal.gratitude')}</h3>
          <input className="bujo-input" placeholder={t('dayModal.gratitudePlaceholder')}
            value={form.gratitude} onChange={(e) => update('gratitude', e.target.value)} />
        </section>

        <section className="modal-section">
          <h3>{t('dayModal.habits')}</h3>
          <div className="habit-checklist">
            {habits.map((h) => (
              <label key={h.id} className="habit-check">
                <input type="checkbox" checked={!!form.habits[h.id]} onChange={() => toggleHabit(h.id)} />
                <span className="habit-emoji">{h.emoji}</span>
                <span>{getHabitLabel(h, lang)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <h3>{t('dayModal.tags')}</h3>
          <div className="quick-tags">
            {QUICK_TAGS.map((tag) => (
              <button key={tag} className={`quick-tag ${form.tags.includes(tag) ? 'active' : ''}`}
                onClick={() => form.tags.includes(tag) ? update('tags', form.tags.filter((tg) => tg !== tag)) : addTag(tag)}>
                {t(`tags.${tag}`)}
              </button>
            ))}
          </div>
          <div className="tag-input-row">
            <input className="bujo-input small" placeholder={t('dayModal.customTag')} value={newTag}
              onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} />
            <button className="bujo-btn small" onClick={() => addTag()}>{t('dayModal.add')}</button>
          </div>
        </section>

        <section className="modal-section">
          <h3>{t('medications.title')}</h3>
          <div className="med-list">
            {(form.medications || []).map((med) => (
              <span key={med} className="tag">{med} <button type="button" className="tag-remove" onClick={() => removeMedication(med)}>×</button></span>
            ))}
          </div>
          {commonMedications.length > 0 && (
            <div className="quick-tags">
              {commonMedications.filter((m) => !(form.medications || []).includes(m)).map((med) => (
                <button key={med} type="button" className="quick-tag" onClick={() => addMedication(med)}>{med}</button>
              ))}
            </div>
          )}
          <div className="tag-input-row">
            <input className="bujo-input small" placeholder={t('medications.add')} value={newMed}
              onChange={(e) => setNewMed(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addMedication()} />
            <button type="button" className="bujo-btn small" onClick={() => addMedication()}>{t('dayModal.add')}</button>
          </div>
          {form.weather && (
            <p className="weather-badge">🌤 {form.weather.temp}° · {t(`weather.${form.weather.condition}`)}</p>
          )}
        </section>

        <section className="modal-section">
          <h3>{t('dayModal.triggers')}</h3>
          <input className="bujo-input" placeholder={t('dayModal.triggersPlaceholder')}
            value={form.triggers || ''} onChange={(e) => update('triggers', e.target.value)} />
        </section>

        <section className="modal-section">
          <h3>{t('dayModal.photo')}</h3>
          {form.photo ? (
            <div className="day-photo-preview">
              <img src={form.photo} alt="" />
              <button className="bujo-btn small ghost" onClick={() => update('photo', null)}>{t('dayModal.removePhoto')}</button>
            </div>
          ) : (
            <input type="file" accept="image/*" className="bujo-input" onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file || file.size > 2000000) return
              const reader = new FileReader()
              reader.onload = async () => update('photo', await compressImage(reader.result))
              reader.readAsDataURL(file)
            }} />
          )}
        </section>

        <section className="modal-section">
          <h3>{t('dayModal.voice')}</h3>
          {form.voiceNote ? (
            <div className="voice-preview">
              <audio controls src={form.voiceNote} />
              <button className="bujo-btn small ghost" onClick={() => update('voiceNote', null)}>{t('dayModal.removeVoice')}</button>
            </div>
          ) : (
            <button className="bujo-btn small" onClick={recording ? stopRecording : startRecording}>
              {recording ? t('dayModal.stopRecord') : t('dayModal.recordVoice')}
            </button>
          )}
        </section>

        <section className="modal-section">
          <h3>{t('prompts.daily')}</h3>
          <p className="prompt-question">{getDailyPrompt(lang)}</p>
          <textarea className="bujo-textarea" placeholder={t('prompts.answerPlaceholder')}
            value={form.promptAnswer || ''} onChange={(e) => update('promptAnswer', e.target.value)} rows={2} />
        </section>

        <section className="modal-section">
          <h3>{t('dayModal.notes')}</h3>
          <textarea className="bujo-textarea" placeholder={t('dayModal.notesPlaceholder')}
            value={form.note} onChange={(e) => update('note', e.target.value)} rows={3} />
        </section>

        <div className="modal-actions">
          <button className="bujo-btn danger" onClick={handleDelete}>{t('dayModal.clearDay')}</button>
          <button className="bujo-btn primary" onClick={handleSave}>{t('dayModal.save')}</button>
        </div>
      </div>
    </div>
  )
}
