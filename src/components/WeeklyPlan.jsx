import { useMemo, useState } from 'react'
import {
  WEEKLY_PLAN_TEMPLATE,
  getTodaysMission,
  evaluateBadges,
  generateUsageHistory,
  detectLeak,
  computeCreditScore,
  compareToSimilarHouseholds,
  generateActivityBreakdown,
} from '../data/simulateData.js'

export default function WeeklyPlan() {
  const [done, setDone] = useState({})
  const [missionDone, setMissionDone] = useState(false)
  const mission = useMemo(() => getTodaysMission(), [])

  const history = useMemo(() => generateUsageHistory(14), [])
  const leak = useMemo(() => detectLeak(history), [history])
  const creditScore = useMemo(() => computeCreditScore(history), [history])
  const today = history[history.length - 1].liters
  const activities = useMemo(() => generateActivityBreakdown(today), [today])
  const showerLiters = activities.find((a) => a.name.includes('Bathing'))?.liters ?? 60
  const { percentile } = compareToSimilarHouseholds(today)

  const badges = evaluateBadges({
    leakDetectedEver: true, // demo: the leak simulator has been used before
    score: creditScore,
    percentile,
    showerLiters,
    leak,
  })
  const unlockedCount = badges.filter((b) => b.unlocked).length

  const completedCount = Object.values(done).filter(Boolean).length
  const progressPct = Math.round((completedCount / WEEKLY_PLAN_TEMPLATE.length) * 100)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Weekly Action Plan &amp; Missions</h1>
          <p>A fitness-app style checklist for water conservation, plus today's mission and your unlocked badges.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Today's Mission</div>
          <div className="mission-card">
            <div className="mission-icon">{mission.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="mission-text">{mission.text}</div>
              <div className="stat-delta">Save ~{mission.savingsLiters}L today</div>
            </div>
            <button
              className={`btn ${missionDone ? 'ghost' : ''}`}
              onClick={() => setMissionDone((v) => !v)}
            >
              {missionDone ? '✔ Done' : 'Mark Done'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Weekly Progress</div>
          <div className="stat-value" style={{ fontSize: 30 }}>{completedCount} / {WEEKLY_PLAN_TEMPLATE.length}</div>
          <div className="mission-progress-track" style={{ marginTop: 10 }}>
            <div className="mission-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="stat-delta" style={{ marginTop: 8 }}>{progressPct}% of this week's plan complete</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">This Week's Plan</div>
        <div className="plan-list">
          {WEEKLY_PLAN_TEMPLATE.map((item) => (
            <label key={item.day} className={`plan-row ${done[item.day] ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={Boolean(done[item.day])}
                onChange={() => setDone((prev) => ({ ...prev, [item.day]: !prev[item.day] }))}
              />
              <span className="plan-day">{item.day}</span>
              <span className="plan-icon">{item.icon}</span>
              <span className="plan-task">{item.task}</span>
              {item.savings > 0 && <span className="plan-savings">~{item.savings}L</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Achievement Badges — {unlockedCount} / {badges.length} unlocked</div>
        <div className="badge-grid">
          {badges.map((b) => (
            <div key={b.id} className={`badge-tile ${b.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
