export default function HabitHeatmap({ grid, daysInMonth }) {
  if (!grid?.length) return null

  return (
    <div className="habit-heatmap">
      {grid.map(({ habit, days }) => (
        <div key={habit.id} className="heatmap-row">
          <span className="heatmap-label" title={habit.label || habit.labelKey}>{habit.emoji}</span>
          <div className="heatmap-cells">
            {days.map((done, i) => (
              <span
                key={i}
                className={`heatmap-cell ${done ? 'done' : ''}`}
                title={`Day ${i + 1}`}
              />
            ))}
          </div>
          <span className="heatmap-count">{days.filter(Boolean).length}/{daysInMonth}</span>
        </div>
      ))}
    </div>
  )
}
