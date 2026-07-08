import { useEffect, useState } from 'react'
import { getUserLocation, fetchRainForecast } from '../data/weatherApi.js'
import { TAMIL_NADU_RESERVOIRS } from '../data/simulateData.js'
import { useT } from '../i18n/LangContext.jsx'

function riskLabel(score) {
  if (score >= 70) return { label: 'Severe', color: 'var(--rose)' }
  if (score >= 45) return { label: 'Moderate', color: 'var(--amber)' }
  return { label: 'Low', color: 'var(--mint)' }
}

export default function DroughtRiskScore() {
  const [status, setStatus] = useState('loading')
  const [score, setScore] = useState(null)
  const t = useT()

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const loc = await getUserLocation()
        const days = await fetchRainForecast(loc.lat, loc.lng)
        if (cancelled) return
        const avgRainChance = days.reduce((a, d) => a + d.rainChancePct, 0) / days.length
        const avgFullnessPct =
          (TAMIL_NADU_RESERVOIRS.reduce((a, r) => a + r.currentSurfaceAreaKm2 / r.fullCapacityKm2, 0) /
            TAMIL_NADU_RESERVOIRS.length) * 100
        const riskScore = Math.max(0, Math.min(100, Math.round((100 - avgRainChance) * 0.45 + (100 - avgFullnessPct) * 0.55)))
        setScore(riskScore)
        setStatus('ready')
      } catch (err) {
        console.error('Drought risk calculation failed:', err)
        if (!cancelled) setStatus('error')
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const risk = score !== null ? riskLabel(score) : null

  return (
    <div className="card">
      <div className="section-title">🌡️ {t('droughtRisk')}</div>
      {status === 'loading' && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          <span className="typing-dots"><span></span><span></span><span></span></span>
          &nbsp;Calculating from live rain forecast + reservoir levels…
        </p>
      )}
      {status === 'error' && (
        <p style={{ fontSize: 13, color: 'var(--rose)', margin: 0 }}>
          Couldn't calculate risk — check your internet connection.
        </p>
      )}
      {status === 'ready' && risk && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <div className="stat-value" style={{ color: risk.color }}>{score}<span style={{ fontSize: 14 }}>/100</span></div>
            <span className="pill" style={{ color: risk.color, borderColor: risk.color }}>{risk.label}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Combines live 3-day rain forecast (Open-Meteo) with average Tamil Nadu reservoir fullness.
          </p>
        </>
      )}
    </div>
  )
}
