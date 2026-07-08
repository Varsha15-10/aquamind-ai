import { useMemo, useState } from 'react'
import { computeEmergencyBudget, DROUGHT_DAILY_PLAN } from '../data/simulateData.js'
import CountUp from './CountUp.jsx'

const SEVERITIES = [
  { id: 'mild', label: 'Mild advisory' },
  { id: 'moderate', label: 'Moderate drought' },
  { id: 'severe', label: 'Severe emergency' },
]

export default function EmergencyMode() {
  const [enabled, setEnabled] = useState(false)
  const [householdSize, setHouseholdSize] = useState(4)
  const [severity, setSeverity] = useState('moderate')
  const [droughtDone, setDroughtDone] = useState({})

  const budget = useMemo(
    () => computeEmergencyBudget({ householdSize, severity }),
    [householdSize, severity]
  )

  const droughtCompletedCount = Object.values(droughtDone).filter(Boolean).length
  const droughtTotalSavings = DROUGHT_DAILY_PLAN.reduce((a, d) => a + d.savings, 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🚨 Water Emergency Mode</h1>
          <p>Switch on a strict daily water budget during a declared drought or shortage.</p>
        </div>
        <button
          className={`btn ${enabled ? 'danger-outline' : ''}`}
          onClick={() => setEnabled((v) => !v)}
        >
          {enabled ? 'Emergency Mode: ON' : 'Enable Emergency Mode'}
        </button>
      </div>

      {enabled && (
        <div className="leak-banner" style={{ marginBottom: 18 }}>
          <div>
            <strong>Emergency Mode active:</strong> your household budget is capped at {budget.dailyLimit}L/day.
            Non-essential use (garden, car washing) should stop until conditions improve.
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Set Your Household</div>
          <div className="field-row">
            <label>Household size</label>
            <input
              type="number"
              min={1}
              max={12}
              value={householdSize}
              onChange={(e) => setHouseholdSize(Math.max(1, Number(e.target.value)))}
              className="text-input"
            />
          </div>
          <div className="field-row">
            <label>Severity level</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="text-input">
              {SEVERITIES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, marginBottom: 0 }}>
            Per-person limits: mild 135L/day, moderate 100L/day, severe 70L/day — modeled on typical drought
            emergency water-rationing guidance.
          </p>
        </div>

        <div className="card">
          <div className="section-title">Your Daily Emergency Budget</div>
          <div className="stat-value" style={{ fontSize: 30, color: 'var(--rose)' }}>
            <CountUp value={budget.dailyLimit} suffix=" L / day" />
          </div>
          <div className="grid grid-2" style={{ marginTop: 18, gap: 12 }}>
            <div>
              <div className="stat-label">Essential use budget</div>
              <div className="stat-value" style={{ fontSize: 20 }}><CountUp value={budget.essential} suffix=" L" /></div>
              <div className="stat-delta">Drinking, cooking, hygiene</div>
            </div>
            <div>
              <div className="stat-label">Non-essential budget</div>
              <div className="stat-value" style={{ fontSize: 20, color: 'var(--amber)' }}><CountUp value={budget.nonEssential} suffix=" L" /></div>
              <div className="stat-delta" style={{ color: 'var(--amber)' }}>Garden, washing, extras</div>
            </div>
          </div>
        </div>
      </div>

      {(severity === 'severe' || enabled) && (
        <div className="card">
          <div className="section-title">
            🌾 Drought Season — 7-Day Daily Water-Saving Plan
            <span className="pill warn" style={{ marginLeft: 10 }}>
              Up to {droughtTotalSavings}L/day saveable
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0 }}>
            When a drought is declared, follow this stricter day-by-day plan on top of your emergency budget above.
          </p>
          <div className="stat-delta" style={{ marginBottom: 10 }}>
            {droughtCompletedCount} / {DROUGHT_DAILY_PLAN.length} days completed this cycle
          </div>
          <div className="plan-list">
            {DROUGHT_DAILY_PLAN.map((item) => (
              <label key={item.day} className={`plan-row ${droughtDone[item.day] ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={Boolean(droughtDone[item.day])}
                  onChange={() => setDroughtDone((prev) => ({ ...prev, [item.day]: !prev[item.day] }))}
                />
                <span className="plan-day">{item.day}</span>
                <span className="plan-icon">{item.icon}</span>
                <span className="plan-task">{item.task}</span>
                {item.savings > 0 && <span className="plan-savings">~{item.savings}L</span>}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
