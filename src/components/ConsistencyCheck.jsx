import { useMemo } from 'react'
import {
  generateUsageHistory,
  generateForecast,
  detectLeak,
  computeCreditScore,
  TAMIL_NADU_RESERVOIRS,
} from '../data/simulateData.js'
import { useT } from '../i18n/LangContext.jsx'

// Runs a handful of live sanity checks against the app's own data functions,
// and lists which features use REAL external data vs. SIMULATED demo data —
// useful to show judges exactly what's real, and to catch obvious bugs
// before a live demo.
function runChecks() {
  const checks = []

  try {
    const history = generateUsageHistory(14)
    checks.push({
      name: 'generateUsageHistory returns 15 days (14 + today)',
      pass: history.length === 15,
      detail: `Got ${history.length} entries`,
    })
    checks.push({
      name: 'All usage readings are positive numbers',
      pass: history.every((d) => typeof d.liters === 'number' && d.liters > 0),
      detail: `Min: ${Math.min(...history.map((d) => d.liters))}L`,
    })

    const forecast = generateForecast(history, 7)
    checks.push({
      name: 'generateForecast returns exactly 7 future days',
      pass: forecast.length === 7,
      detail: `Got ${forecast.length} entries`,
    })

    const leak = detectLeak(history)
    checks.push({
      name: 'Leak confidence is between 0 and 1',
      pass: leak.confidence >= 0 && leak.confidence <= 1,
      detail: `confidence = ${leak.confidence}`,
    })

    const score = computeCreditScore(history)
    checks.push({
      name: 'Water Credit Score is within 0-100 bounds',
      pass: score >= 0 && score <= 100,
      detail: `score = ${score}`,
    })

    checks.push({
      name: 'Tamil Nadu reservoir surface area never exceeds full capacity',
      pass: TAMIL_NADU_RESERVOIRS.every((r) => r.currentSurfaceAreaKm2 <= r.fullCapacityKm2),
      detail: `${TAMIL_NADU_RESERVOIRS.length} reservoirs checked`,
    })
  } catch (err) {
    checks.push({ name: 'Unexpected error while running checks', pass: false, detail: String(err) })
  }

  return checks
}

const DATA_SOURCES = [
  { feature: 'Reservoir evaporation (Satellite Monitor)', source: 'NASA POWER API', real: true },
  { feature: 'Drought Risk Score rain data', source: 'Open-Meteo API', real: true },
  { feature: 'Reservoir locations (Tamil Nadu map)', source: 'Real GPS coordinates', real: true },
  { feature: 'Household usage history', source: 'Simulated (demo data)', real: false },
  { feature: 'Reservoir surface area figures', source: 'Simulated estimate', real: false },
  { feature: 'AI Water Advisor replies', source: 'Rule-based / optional Gemini API', real: false },
  { feature: 'Leak/anomaly detection', source: 'Real statistical z-score model on live-in-app data', real: true },
]

export default function ConsistencyCheck() {
  const t = useT()
  const checks = useMemo(() => runChecks(), [])
  const passCount = checks.filter((c) => c.pass).length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('consistencyCheck')}</h1>
          <p>Live sanity checks on the app's data logic, plus a transparency table of real vs. simulated data.</p>
        </div>
        <span className={`pill ${passCount === checks.length ? 'ok' : 'danger'}`}>
          {passCount}/{checks.length} checks passed
        </span>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">Live Data Logic Checks</div>
        <div className="activity-list">
          {checks.map((c) => (
            <div className="leak-history-row" key={c.name}>
              <span className={`pill ${c.pass ? 'ok' : 'danger'}`} style={{ minWidth: 60, justifyContent: 'center' }}>
                {c.pass ? '✔ Pass' : '✘ Fail'}
              </span>
              <div className="leak-history-detail">
                <div>{c.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">What's Real vs. Simulated</div>
        <div className="activity-list">
          {DATA_SOURCES.map((d) => (
            <div className="leak-history-row" key={d.feature}>
              <span className={`pill ${d.real ? 'ok' : 'warn'}`} style={{ minWidth: 90, justifyContent: 'center' }}>
                {d.real ? '🌐 Real' : '🎲 Simulated'}
              </span>
              <div className="leak-history-detail">
                <div>{d.feature}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.source}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, marginBottom: 0 }}>
          Being upfront about this is intentional — it shows exactly where real external data feeds
          into the app today, and what's still demo data pending real IoT/sensor integration.
        </p>
      </div>
    </div>
  )
}
