import { useMemo } from 'react'
import { generateUsageHistory, computeCreditScore, leaderboardSeed } from '../data/simulateData.js'

export default function CommunityScore() {
  const history = useMemo(() => generateUsageHistory(14), [])
  const score = useMemo(() => computeCreditScore(history), [history])

  const board = useMemo(() => {
    const rows = leaderboardSeed.map((r) => (r.name === 'You' ? { ...r, score } : r))
    return rows.sort((a, b) => b.score - a.score)
  }, [score])

  const circumference = 2 * Math.PI * 52

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Community Water Credit Score</h1>
          <p>A trust score that rewards consistent, leak-free, below-baseline usage.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Your Score</div>
          <div className="score-ring-wrap">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="#22d3ee" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (score / 100) * circumference}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div>
              <div className="score-num">{score}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}> / 100</span></div>
              <div className="stat-delta">
                {score >= 80 ? 'Excellent — top tier conservation' : score >= 60 ? 'Good — room to improve' : 'Needs attention'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">How It's Calculated</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0, lineHeight: 1.6 }}>
            Your score weighs three signals: (1) daily usage vs. your region's baseline,
            (2) consistency over the last 30 days, and (3) leak-free streaks. Utilities can use
            aggregated scores to offer tariff incentives for conservation-minded households.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Neighborhood Leaderboard</div>
        {board.map((row) => (
          <div className="leaderboard-row" key={row.name}>
            <span style={{ fontWeight: row.name === 'You' ? 700 : 400, color: row.name === 'You' ? 'var(--aqua)' : 'inherit' }}>
              {row.name}
            </span>
            <span className="stat-delta" style={{ color: 'var(--text-primary)' }}>{row.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
