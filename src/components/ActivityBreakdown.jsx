import { useState } from 'react'
import { generateActivityBreakdown } from '../data/simulateData.js'

export default function ActivityBreakdown({ totalLiters }) {
  const activities = generateActivityBreakdown(totalLiters)
  const max = Math.max(...activities.map((a) => a.liters))
  const [openTip, setOpenTip] = useState(null)

  return (
    <div className="card">
      <div className="section-title">Where Today's Water Went</div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -6, marginBottom: 18 }}>
        Estimated breakdown of your {totalLiters}L usage across everyday activities. Tap a row for a saving tip.
      </p>

      <div className="activity-list">
        {activities.map((a) => (
          <div key={a.name}>
            <div
              className="activity-row"
              onClick={() => setOpenTip(openTip === a.name ? null : a.name)}
            >
              <div className="activity-label">
                <span className="activity-icon">{a.icon}</span>
                <span>{a.name}</span>
              </div>
              <div className="activity-bar-track">
                <div
                  className="activity-bar-fill"
                  style={{ width: `${Math.max(4, (a.liters / max) * 100)}%` }}
                />
              </div>
              <div className="activity-value">{a.liters} L</div>
            </div>
            {openTip === a.name && (
              <div className="activity-tip">💡 {a.tip}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
