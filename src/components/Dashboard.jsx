import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  generateUsageHistory,
  generateForecast,
  detectLeak,
  simulateLeakSpike,
  computeCreditScore,
  computeWaterHealthScore,
  explainScoreChange,
  leakProbabilityLevel,
  getTodaysMission,
  compareToSimilarHouseholds,
  generateHourlyTick,
  predictNationalReserveOutlook,
  getCurrentSeason,
} from '../data/simulateData.js'
import { getAdvisorReplyAsync } from '../utils/aiAdvisor.js'
import WaveDivider from './WaveDivider.jsx'
import CountUp from './CountUp.jsx'
import ActivityBreakdown from './ActivityBreakdown.jsx'
// --- NEW (additive) ---
import { loadLeakHistory, addLeakEvent, resolveLatestLeak } from '../data/leakHistory.js'
import DroughtRiskScore from './DroughtRiskScore.jsx'
import LeakHistoryLog from './LeakHistoryLog.jsx'
import SmsSimulator from './SmsSimulator.jsx'
import MunicipalReport from './MunicipalReport.jsx'
import { t } from '../i18n/translations.js'

export default function Dashboard({ lang = 'en' }) {
  const [history, setHistory] = useState(() => generateUsageHistory(14))
  // --- NEW (additive) ---
  const [leakHistory, setLeakHistory] = useState(() => loadLeakHistory())
  const [smsTrigger, setSmsTrigger] = useState(0)
  const forecast = useMemo(() => generateForecast(history, 7), [history])
  const leak = useMemo(() => detectLeak(history), [history])
  const creditScore = useMemo(() => computeCreditScore(history), [history])
  const healthScore = useMemo(
    () => computeWaterHealthScore({ history, leak, forecast, creditScore }),
    [history, leak, forecast, creditScore]
  )
  const leakLevel = leakProbabilityLevel(leak.confidence)
  const mission = useMemo(() => getTodaysMission(), [])
  const [missionDone, setMissionDone] = useState(false)
  const todayLiters = history[history.length - 1].liters
  const comparison = useMemo(() => compareToSimilarHouseholds(todayLiters), [todayLiters])

  const [explainText, setExplainText] = useState(null)
  const [explainLoading, setExplainLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const season = useMemo(() => getCurrentSeason(), [])
  const reserveOutlook = useMemo(() => predictNationalReserveOutlook(undefined, season), [season])

  // Simulates a live smart-meter feed: the latest reading nudges every hour,
  // as if new sensor data just arrived. In production this would be a
  // WebSocket/polling connection to the utility's IoT gateway.
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => generateHourlyTick(prev))
      setLastUpdated(new Date())
    }, 60 * 60 * 1000) // every 1 hour
    return () => clearInterval(interval)
  }, [])

  // --- NEW (additive): log a leak alert history entry + trigger simulated SMS ---
  useEffect(() => {
    if (!leak.isLeak) return
    const alreadyActive = leakHistory.some((e) => e.status === 'active')
    if (alreadyActive) return
    const event = {
      id: Date.now(),
      detectedAt: new Date().toISOString(),
      resolvedAt: null,
      status: 'active',
      reading: leak.lastReading,
      confidence: Number(leak.confidence),
    }
    setLeakHistory((prev) => addLeakEvent(prev, event))
    setSmsTrigger((n) => n + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leak.isLeak])

  const litersSavedToday = useMemo(() => {
    const baseline = 220
    const today = history[history.length - 1]?.liters ?? baseline
    return Math.max(0, baseline - today)
  }, [history])

  function handleSimulateLeak() {
    setHistory((prev) => simulateLeakSpike(prev))
  }

  function handleResetDemo() {
    setHistory(generateUsageHistory(14))
    setLeakHistory((prev) => resolveLatestLeak(prev)) // NEW (additive)
  }

  async function handleExplainDashboard() {
    setExplainLoading(true)
    const deterministic = explainScoreChange(history)
    const prompt = `In 2-3 friendly sentences, summarize a household's water dashboard: today's usage is ${todayLiters}L, the 14-day average is ${leak.mean}L, leak probability is ${leakLevel.level}, and their Water Health Score is ${healthScore.score}/100. Base fact to build on: ${deterministic}`
    const reply = await getAdvisorReplyAsync(prompt)
    setExplainText(reply && reply.length > 20 ? reply : deterministic)
    setExplainLoading(false)
  }

  const circumference = 2 * Math.PI * 42

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t(lang, 'householdDashboard')}</h1>
          <p>{t(lang, 'dashboardSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span className={`pill ${leak.isLeak ? 'danger' : 'ok'}`}>
            {leak.isLeak ? `● ${t(lang, 'leakDetected')}` : `● ${t(lang, 'systemHealthy')}`}
          </span>
          <span className="pill" style={{ fontSize: 11 }}>
            🔄 Live feed · updates hourly · last: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <WaveDivider />

      {leak.isLeak && (
        <div className="leak-banner">
          <div>
            <strong>Anomaly detected:</strong> latest reading is {leak.lastReading}L vs. an average
            of {leak.mean}L — confidence {Math.round(leak.confidence * 100)}%. This pattern is
            consistent with a pipe leak or fixture failure.
          </div>
          <button className="btn danger-outline" onClick={handleResetDemo}>
            {t(lang, 'markResolved')}
          </button>
        </div>
      )}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="hero-ripple">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="bubble"
              style={{
                left: `${8 + i * 12}%`,
                width: `${6 + (i % 4) * 4}px`,
                height: `${6 + (i % 4) * 4}px`,
                animationDuration: `${4 + (i % 5)}s`,
                animationDelay: `${i * 0.6}s`,
                '--drift': `${(i % 2 === 0 ? 1 : -1) * (10 + i * 3)}px`,
              }}
            />
          ))}
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="hero-number">
            <div className="stat-label">{t(lang, 'litersSavedToday')}</div>
            <div className="stat-value"><CountUp value={litersSavedToday} suffix=" L" /></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">🌦️ Climate Outlook — National Reserve, Next 7 Days</div>
        <div className="grid grid-4">
          <div>
            <div className="stat-label">Current season</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{reserveOutlook.season}</div>
          </div>
          <div>
            <div className="stat-label">Reserves now</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{reserveOutlook.currentPctFull}% full</div>
          </div>
          <div>
            <div className="stat-label">Projected in 7 days</div>
            <div className="stat-value" style={{ fontSize: 18, color: reserveOutlook.projectedPctFull < reserveOutlook.currentPctFull ? 'var(--rose)' : 'var(--mint)' }}>
              {reserveOutlook.projectedPctFull}% full
            </div>
          </div>
          <div>
            <div className="stat-label">Expected change</div>
            <div className="stat-value" style={{ fontSize: 18, color: reserveOutlook.pctChange < 0 ? 'var(--rose)' : 'var(--mint)' }}>
              {reserveOutlook.pctChange >= 0 ? '+' : ''}{reserveOutlook.pctChange}%
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, marginBottom: 0 }}>
          Based on {reserveOutlook.bodiesCounted} tracked dams/lakes/tanks nationwide, adjusted for the current
          climate season. See the Satellite Monitor page for a per-reservoir breakdown.
        </p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label={t(lang, 'todaysUsage')} value={todayLiters} unit=" L" delta="vs 220L baseline" />
        <StatCard label={t(lang, 'fourteenDayAvg')} value={leak.mean} unit=" L" delta="rolling average" />
        <StatCard label={t(lang, 'forecastAvg')} value={Math.round(forecast.reduce((a, b) => a + b.liters, 0) / forecast.length)} unit=" L" delta="AI predicted" />
        <div className="card">
          <div className="stat-label">Leak probability</div>
          <div className="stat-value" style={{ fontSize: 24 }}>{leakLevel.color} {leakLevel.level}</div>
          <div className="stat-delta">z-score {leak.zScore}</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Water Health Score</div>
          <div className="score-ring-wrap">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="#22d3ee" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (healthScore.score / 100) * circumference}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div>
              <div className="score-num">{healthScore.score}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}> /100</span></div>
              <div className="stat-delta">{explainScoreChange(history)}</div>
            </div>
          </div>
          <div className="score-breakdown">
            {healthScore.breakdown.map((b) => (
              <div key={b.label} className="score-breakdown-row">
                <span>{b.label}</span>
                <span className="stat-delta" style={{ color: 'var(--text-primary)' }}>{b.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">✨ Explain My Dashboard</div>
          {explainText ? (
            <p className="explain-text">{explainText}</p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0 }}>
              Tap below and the AI Water Advisor will summarize today's numbers in plain language.
            </p>
          )}
          <button className="btn" onClick={handleExplainDashboard} disabled={explainLoading}>
            {explainLoading ? 'Thinking…' : '✨ Explain My Dashboard'}
          </button>
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
            <button className={`btn ${missionDone ? 'ghost' : ''}`} onClick={() => setMissionDone((v) => !v)}>
              {missionDone ? '✔ Done' : 'Mark Done'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="section-title">You vs. Similar Households</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div>
              <div className="stat-label">You</div>
              <div className="stat-value" style={{ fontSize: 24 }}>{todayLiters} L</div>
            </div>
            <div>
              <div className="stat-label">Average similar family</div>
              <div className="stat-value" style={{ fontSize: 24, color: 'var(--text-muted)' }}>{comparison.avgSimilar} L</div>
            </div>
          </div>
          <div className="stat-delta" style={{ marginTop: 10, color: comparison.diffPct >= 0 ? 'var(--mint)' : 'var(--rose)' }}>
            {comparison.diffPct >= 0
              ? `Excellent! You're using ${comparison.diffPct}% less — top ${comparison.percentile}%`
              : `You're using ${Math.abs(comparison.diffPct)}% more than similar households`}
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">{t(lang, 'consumptionHistory')}</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="fillAqua" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" stroke="#8fb4bd" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8fb4bd" fontSize={11} tickLine={false} axisLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#0f2530', border: '1px solid rgba(126,220,232,0.2)', borderRadius: 10 }} />
              <Area type="monotone" dataKey="liters" stroke="#22d3ee" fill="url(#fillAqua)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">{t(lang, 'tryItLive')}</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0 }}>
            Simulate a burst pipe or leaking fixture and watch the AI anomaly detector flag it
            instantly on the chart above.
          </p>
          <button className="btn" style={{ width: '100%', marginBottom: 10 }} onClick={handleSimulateLeak}>
            {t(lang, 'simulateLeak')}
          </button>
          <button className="btn ghost" style={{ width: '100%' }} onClick={handleResetDemo}>
            {t(lang, 'resetDemo')}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">{t(lang, 'forecastTitle')}</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={forecast}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="day" stroke="#8fb4bd" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8fb4bd" fontSize={11} tickLine={false} axisLine={false} width={36} />
            <Tooltip contentStyle={{ background: '#0f2530', border: '1px solid rgba(126,220,232,0.2)', borderRadius: 10 }} />
            <Line type="monotone" dataKey="liters" stroke="#f5a524" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ActivityBreakdown totalLiters={history[history.length - 1].liters} />

      {/* ==================== NEW (additive) ==================== */}
      <div className="grid grid-2" style={{ marginTop: 18, marginBottom: 18 }}>
        <DroughtRiskScore />
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>{t(lang, 'municipalReport')}</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Download a PDF summary for municipal/utility review.
          </p>
          <MunicipalReport
            stats={{
              todayUsage: todayLiters,
              avgUsage: leak.mean,
              forecastAvg: Math.round(forecast.reduce((a, b) => a + b.liters, 0) / forecast.length),
              anomalyConfidence: Math.round(leak.confidence * 100),
              creditScore,
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <LeakHistoryLog history={leakHistory} />
      </div>

      <SmsSimulator
        trigger={smsTrigger}
        message={`⚠️ AquaMind Alert: Unusual water usage detected (${leak.lastReading}L). Check your dashboard.`}
      />
    </div>
  )
}

function StatCard({ label, value, unit = '', delta }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="stat-value"><CountUp value={value} suffix={unit} /></div>
      <div className="stat-delta">{delta}</div>
    </div>
  )
}
