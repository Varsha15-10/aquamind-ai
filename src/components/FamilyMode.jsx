import { useMemo } from 'react'
import { generateUsageHistory, generateFamilyUsage, FAMILY_WEEKLY_GOAL_LITERS } from '../data/simulateData.js'

export default function FamilyMode() {
  const history = useMemo(() => generateUsageHistory(7), [])
  const today = history[history.length - 1].liters
  const members = useMemo(() => generateFamilyUsage(today), [today])
  const max = Math.max(...members.map((m) => m.liters))

  const weeklyBaseline = 220 * 7
  const weeklyTotal = history.reduce((a, b) => a + b.liters, 0)
  const weeklySaved = Math.max(0, weeklyBaseline - weeklyTotal)
  const goalProgress = Math.min(100, Math.round((weeklySaved / FAMILY_WEEKLY_GOAL_LITERS) * 100))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Family Mode</h1>
          <p>See how usage splits across your household and compete together toward a shared weekly goal.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">Today's Usage by Family Member</div>
        <div className="activity-list">
          {members.map((m) => (
            <div className="activity-row" key={m.name}>
              <div className="activity-label">
                <span className="activity-icon">🧑</span>
                <span>{m.name}</span>
              </div>
              <div className="activity-bar-track">
                <div className="activity-bar-fill" style={{ width: `${Math.max(4, (m.liters / max) * 100)}%` }} />
              </div>
              <div className="activity-value">{m.liters} L</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Family Challenge</div>
        <p style={{ fontSize: 14, marginTop: 0, marginBottom: 14 }}>
          Goal: save <strong>{FAMILY_WEEKLY_GOAL_LITERS}L</strong> this week, together.
        </p>
        <div className="mission-progress-track">
          <div className="mission-progress-fill" style={{ width: `${goalProgress}%` }} />
        </div>
        <div className="stat-delta" style={{ marginTop: 8 }}>
          {weeklySaved}L saved so far vs. baseline — {goalProgress}% of the family goal
        </div>
      </div>
    </div>
  )
}
