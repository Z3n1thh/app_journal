import html2canvas from 'html2canvas'
import { getFullBackup } from '../storage'
import { getDaysInMonth, dateKey } from '../constants'
import { computeInsights, computeYearReview } from './insights'

export function exportBackup() {
  return getFullBackup()
}

export function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(entries, moods, t) {
  const moodMap = Object.fromEntries(moods.map((m) => [m.id, getMoodDisplay(m, t)]))
  const headers = ['Date', 'Mood', 'Energy', 'Sleep (h)', 'Water', 'Gratitude', 'Note', 'Tags', 'Habits']
  const rows = Object.entries(entries).sort().map(([key, e]) => [
    key,
    e.mood ? moodMap[e.mood] || e.mood : '',
    e.energy || '',
    e.sleepHours ?? '',
    e.waterGlasses ?? '',
    csvEscape(e.gratitude || ''),
    csvEscape(e.note || ''),
    csvEscape((e.tags || []).join('; ')),
    csvEscape(Object.entries(e.habits || {}).filter(([, v]) => v).map(([k]) => k).join('; ')),
  ])
  return [headers, ...rows].map((r) => r.join(',')).join('\n')
}

function csvEscape(str) {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function getMoodDisplay(mood, t) {
  return `${mood.emoji} ${mood.label || t(`moods.${mood.id}`)}`
}

export function downloadCSV(entries, moods, t) {
  const csv = exportCSV(entries, moods, t)
  downloadFile(csv, `bujo-export-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv')
}

export function exportPDF(entries, profile, months, t) {
  const sorted = Object.entries(entries).sort().reverse().slice(0, 60)
  const rows = sorted.map(([key, e]) => {
    const { month, day } = parseKey(key)
    return `<tr>
      <td>${months[month]} ${day}</td>
      <td>${e.mood || '—'}</td>
      <td>${e.energy || '—'}</td>
      <td>${e.gratitude || ''}</td>
      <td>${e.note || ''}</td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><title>Bujo Export</title>
    <style>body{font-family:sans-serif;padding:2rem;color:#111}table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f5f5}</style></head>
    <body><h1>Bujo Mood Tracker</h1><p>${profile?.name || ''} — ${new Date().toLocaleDateString()}</p>
    <table><thead><tr><th>Date</th><th>Mood</th><th>Energy</th><th>Gratitude</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`

  openPrintWindow(html)
}

function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

export async function exportMonthImage(selector = '#calendar-export', filename = 'bujo-month.png') {
  const node = document.querySelector(selector.startsWith('#') ? selector : `#${selector}`)
  if (!node) return false
  try {
    const canvas = await html2canvas(node, {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#f7f4ef',
      scale: 2,
      useCORS: true,
    })
    canvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
    return true
  } catch {
    return false
  }
}

export function exportMonthSpreadPDF({
  entries, habits, moods, profile, year, month, months, weekdays,
  intention, reflection, t,
}) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  let cells = ''
  for (let i = 0; i < startOffset; i++) cells += '<td class="empty"></td>'
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(year, month, d)
    const entry = entries[key]
    const mood = moods.find((m) => m.id === entry?.mood)
    cells += `<td class="day">${d}${mood ? `<br><span>${mood.emoji}</span>` : ''}</td>`
    if ((startOffset + d) % 7 === 0) cells += '</tr><tr>'
  }

  const habitRows = habits.map((h) => {
    let checks = ''
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(year, month, d)
      const done = entries[key]?.habits?.[h.id]
      checks += `<td>${done ? '✓' : ''}</td>`
    }
    return `<tr><td>${h.emoji} ${h.label || t(`habits.${h.labelKey}`) || h.id}</td>${checks}</tr>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><title>${months[month]} ${year}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: Georgia, serif; color: #222; font-size: 11px; }
      h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 4px; text-align: center; }
      th { background: #f5f0e8; font-weight: 600; }
      td.day { min-width: 28px; height: 36px; vertical-align: top; }
      td.empty { background: #fafafa; }
      .section { margin-top: 1rem; }
      .section h2 { font-size: 1rem; margin-bottom: 0.25rem; }
      .note { border: 1px dashed #ccc; padding: 8px; min-height: 48px; }
    </style></head>
    <body>
      <h1>${months[month]} ${year}</h1>
      <p>${profile?.name || ''} · Bujo Mood Tracker</p>
      <div class="grid">
        <div>
          <table><thead><tr>${weekdays.map((w) => `<th>${w}</th>`).join('')}</tr></thead>
          <tbody><tr>${cells}</tr></tbody></table>
        </div>
        <div>
          <div class="section"><h2>${t('tracking.monthlyFocus', { month: months[month] })}</h2>
            <div class="note">${intention || '—'}</div></div>
          <div class="section"><h2>${t('reflection.title')}</h2>
            <p><strong>${t('reflection.wentWell')}</strong> ${reflection?.wentWell || '—'}</p>
            <p><strong>${t('reflection.toImprove')}</strong> ${reflection?.toImprove || '—'}</p></div>
        </div>
      </div>
      <div class="section"><h2>${t('tracking.habitsSection')}</h2>
        <table><thead><tr><th></th>${Array.from({ length: daysInMonth }, (_, i) => `<th>${i + 1}</th>`).join('')}</tr></thead>
        <tbody>${habitRows}</tbody></table>
      </div>
    </body></html>`

  openPrintWindow(html)
}

export function exportShareCard({ profile, monthName, year, moodCounts, moods, loggingStreak, t }) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
  gradient.addColorStop(0, '#f7f4ef')
  gradient.addColorStop(1, '#e8dfd0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1080, 1080)

  ctx.fillStyle = '#3d3428'
  ctx.font = 'bold 52px Georgia, serif'
  ctx.fillText(`${monthName} ${year}`, 80, 120)
  ctx.font = '36px Georgia, serif'
  ctx.fillStyle = '#6b5d4d'
  ctx.fillText(profile?.name || t('appName'), 80, 175)

  const total = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1
  let y = 280
  ctx.font = '32px sans-serif'
  for (const [moodId, count] of Object.entries(moodCounts)) {
    const mood = moods.find((m) => m.id === moodId)
    if (!mood) continue
    const pct = Math.round((count / total) * 100)
    ctx.fillStyle = '#3d3428'
    ctx.fillText(`${mood.emoji}  ${pct}%`, 80, y)
    ctx.fillStyle = mood.color || '#8b6914'
    ctx.fillRect(320, y - 24, (pct / 100) * 600, 28)
    y += 70
  }

  ctx.fillStyle = '#8b6914'
  ctx.font = 'bold 48px Georgia, serif'
  ctx.fillText(`🔥 ${loggingStreak} ${t('tracking.dayStreak')}`, 80, 900)
  ctx.font = '28px sans-serif'
  ctx.fillStyle = '#6b5d4d'
  ctx.fillText('Bujo Mood Tracker', 80, 980)

  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `bujo-share-${monthName}-${year}.png`
    a.click()
    URL.revokeObjectURL(a.href)
  }, 'image/png')
}

function openPrintWindow(html) {
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
    w.onload = () => w.print()
  }
}

export function exportTherapistPDF(entries, profile, months, t, { from, to, redactNotes = false } = {}) {
  const sorted = Object.entries(entries)
    .filter(([key]) => (!from || key >= from) && (!to || key <= to))
    .sort()
  const rows = sorted.map(([key, e]) => {
    const { month, day } = parseKey(key)
    const note = redactNotes && e.note ? '[redacted]' : (e.note || '')
    return `<tr>
      <td>${months[month]} ${day}</td>
      <td>${e.mood || '—'}</td>
      <td>${e.energy || '—'}</td>
      <td>${e.sleepHours ?? '—'}</td>
      <td>${(e.tags || []).join(', ')}</td>
      <td>${e.triggers || ''}</td>
      <td>${e.gratitude || ''}</td>
      <td>${note}</td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><title>Wellness Summary</title>
    <style>body{font-family:Georgia,serif;padding:2rem;color:#111;max-width:800px;margin:0 auto}
    h1{font-size:1.4rem}table{width:100%;border-collapse:collapse;font-size:0.85rem}
    th,td{border:1px solid #ccc;padding:6px;text-align:left}th{background:#f5f5f5}
    @media print{body{padding:0.5rem}}</style></head>
    <body><h1>Wellness Summary</h1>
    <p>${profile?.name || ''} · ${new Date().toLocaleDateString()}</p>
    <p><em>Personal mood journal export — for discussion with a healthcare provider.</em></p>
    <table><thead><tr><th>Date</th><th>Mood</th><th>Energy</th><th>Sleep</th><th>Tags</th><th>Triggers</th><th>Gratitude</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`

  openPrintWindow(html)
}

export function exportYearBook({ entries, habits, moods, profile, year, months, t }) {
  const review = computeYearReview(entries, habits, year)
  let sections = ''

  for (let m = 0; m < 12; m++) {
    const ins = computeInsights(entries, habits, moods, m, year)
    if (ins.daysLogged === 0) continue
    const topMood = ins.topMood ? moods.find((x) => x.id === ins.topMood.id) : null
    sections += `<section class="month-section">
      <h2>${months[m]} ${year}</h2>
      <p>${ins.daysLogged} ${t('insights.daysLogged')} · ${t('insights.habitRate')}: ${ins.habitRate}%</p>
      ${topMood ? `<p>${t('insights.topMood')}: ${topMood.emoji} ${t(`moods.${topMood.id}`)} (${ins.topMood.count}×)</p>` : ''}
      ${ins.avgSleep ? `<p>${t('insights.avgSleep')}: ${ins.avgSleep}h</p>` : ''}
    </section>`
  }

  const topMoodYear = review.topMood ? moods.find((x) => x.id === review.topMood.id) : null
  const html = `<!DOCTYPE html><html><head><title>${year} Year Book</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: Georgia, serif; color: #222; max-width: 700px; margin: 0 auto; }
      h1 { font-size: 2rem; } .month-section { page-break-inside: avoid; margin-bottom: 1.5rem; border-bottom: 1px dashed #ccc; padding-bottom: 1rem; }
      .year-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 1rem 0; }
    </style></head>
    <body>
      <h1>${t('yearReview.title', { year })}</h1>
      <p>${profile?.name || ''}</p>
      <div class="year-stats">
        <p>${t('yearReview.longestStreak')}: ${review.bestStreak}</p>
        <p>${t('yearReview.topMood')}: ${topMoodYear ? `${topMoodYear.emoji} ${t(`moods.${topMoodYear.id}`)}` : '—'}</p>
        <p>${t('yearReview.bestMonth')}: ${months[review.bestMonth]}</p>
        <p>${t('insights.daysLogged')}: ${review.daysLogged}</p>
      </div>
      ${sections}
    </body></html>`

  openPrintWindow(html)
}

export function downloadBackup() {
  downloadFile(JSON.stringify(exportBackup(), null, 2), `bujo-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
}

export function copyBackupToClipboard() {
  return navigator.clipboard.writeText(JSON.stringify(exportBackup(), null, 2))
}
