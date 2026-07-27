import { useEffect, useRef } from 'react'

export default function MoodTrendChart({ points, label }) {
  const lineRef = useRef(null)
  const scored = points.filter((p) => p.score != null)
  if (scored.length < 2) return null

  const w = 320
  const h = 100
  const pad = 8
  const min = 1
  const max = 5

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2)
    const y = p.score != null
      ? pad + (1 - (p.score - min) / (max - min)) * (h - pad * 2)
      : null
    return { x, y, ...p }
  })

  const segments = []
  let seg = []
  coords.forEach((c) => {
    if (c.y != null) seg.push(c)
    else if (seg.length) { segments.push(seg); seg = [] }
  })
  if (seg.length) segments.push(seg)

  useEffect(() => {
    const el = lineRef.current
    if (!el) return
    const len = el.getTotalLength?.() || 0
    if (len) {
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = `${len}`
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1.2s ease-out'
        el.style.strokeDashoffset = '0'
      })
    }
  }, [points])

  const mainSegment = segments[0] || []

  return (
    <div className="mood-trend-chart">
      {label && <p className="chart-label">{label}</p>}
      <svg viewBox={`0 0 ${w} ${h}`} className="trend-svg" role="img" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => {
          const y = pad + (1 - (n - min) / (max - min)) * (h - pad * 2)
          return <line key={n} x1={pad} y1={y} x2={w - pad} y2={y} className="trend-grid-line" />
        })}
        {mainSegment.length > 1 && (
          <polyline
            ref={lineRef}
            points={mainSegment.map((c) => `${c.x},${c.y}`).join(' ')}
            className="trend-line trend-line-animated"
            fill="none"
          />
        )}
        {segments.slice(1).map((s, i) => (
          <polyline key={i} points={s.map((c) => `${c.x},${c.y}`).join(' ')} className="trend-line" fill="none" />
        ))}
        {coords.filter((c) => c.y != null).map((c) => (
          <circle key={c.key} cx={c.x} cy={c.y} r="3" className="trend-dot" />
        ))}
      </svg>
      <div className="trend-labels">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  )
}
