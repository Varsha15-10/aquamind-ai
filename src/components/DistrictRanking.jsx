import { useState } from 'react'
import { TN_DISTRICT_EFFICIENCY, INDIA_STATE_EFFICIENCY } from '../data/simulateData.js'

export default function DistrictRanking() {
  const [scope, setScope] = useState('india')
  const data = scope === 'india' ? INDIA_STATE_EFFICIENCY : TN_DISTRICT_EFFICIENCY
  const label = scope === 'india' ? 'state' : 'district'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Water-Use Ranking — {scope === 'india' ? 'All India' : 'Tamil Nadu'}</h1>
          <p>Compare water-use efficiency across {scope === 'india' ? 'states' : 'cities'}. Higher efficiency means less wastage relative to supply.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18, padding: 14 }}>
        <div className="filter-group">
          <button className={`filter-pill ${scope === 'india' ? 'active' : ''}`} onClick={() => setScope('india')}>🇮🇳 All India</button>
          <button className={`filter-pill ${scope === 'tn' ? 'active' : ''}`} onClick={() => setScope('tn')}>Tamil Nadu Only</button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">{scope === 'india' ? 'State' : 'City'} Efficiency Leaderboard</div>
        <div className="activity-list">
          {data.map((d) => (
            <div className="activity-row" key={d.city}>
              <div className="activity-label">
                <span className="activity-icon">#{d.rank}</span>
                <span>{d.city}</span>
              </div>
              <div className="activity-bar-track">
                <div
                  className="activity-bar-fill"
                  style={{
                    width: `${d.efficiency}%`,
                    background: d.efficiency >= 80
                      ? 'linear-gradient(90deg, var(--aqua-dim), var(--mint))'
                      : d.efficiency >= 70
                      ? 'linear-gradient(90deg, var(--aqua-dim), var(--aqua))'
                      : 'linear-gradient(90deg, var(--amber), var(--rose))',
                  }}
                />
              </div>
              <div className="activity-value">{d.efficiency}%</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 16, marginBottom: 0 }}>
          Figures are illustrative for this demo. In production, {label} efficiency would be computed from utility
          supply data, satellite reservoir levels, and aggregated Water Health Scores across each {label}.
        </p>
      </div>
    </div>
  )
}
