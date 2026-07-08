import { useMemo } from 'react'
import { NGO_ZONE_DATA, TAMIL_NADU_RESERVOIRS, forecastShortageWeeks } from '../data/simulateData.js'

export default function NGOPortal() {
  const atRiskReservoirs = useMemo(
    () => TAMIL_NADU_RESERVOIRS.map((r) => ({ ...r, weeksLeft: forecastShortageWeeks(r) })).filter((r) => r.weeksLeft),
    []
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>NGO / Government Portal</h1>
          <p>Zone-level consumption, reservoir risk, and community conservation performance — for authorities, not households.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">High-Consumption Zones</div>
        <div className="activity-list">
          {NGO_ZONE_DATA.map((z) => (
            <div className="activity-row" key={z.zone}>
              <div className="activity-label">
                <span className="activity-icon">{z.status === 'High consumption' ? '🔴' : '🟢'}</span>
                <span>{z.zone}</span>
              </div>
              <div className="activity-bar-track">
                <div
                  className="activity-bar-fill"
                  style={{
                    width: `${Math.min(100, (z.consumptionMLD / 3.5) * 100)}%`,
                    background: z.status === 'High consumption'
                      ? 'linear-gradient(90deg, var(--amber), var(--rose))'
                      : 'linear-gradient(90deg, var(--aqua-dim), var(--mint))',
                  }}
                />
              </div>
              <div className="activity-value">{z.consumptionMLD} MLD</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">Reservoirs Trending Toward Shortage</div>
        {atRiskReservoirs.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>No reservoirs currently flagged.</p>
        ) : (
          <div className="activity-list">
            {atRiskReservoirs.map((r) => (
              <div className="activity-row" key={r.id}>
                <div className="activity-label">
                  <span className="activity-icon">🛰️</span>
                  <span>{r.name} ({r.district})</span>
                </div>
                <div className="activity-bar-track">
                  <div
                    className="activity-bar-fill"
                    style={{ width: `${Math.min(100, 100 - r.weeksLeft)}%`, background: 'linear-gradient(90deg, var(--amber), var(--rose))' }}
                  />
                </div>
                <div className="activity-value">~{r.weeksLeft}w left</div>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 16, marginBottom: 0 }}>
          "Weeks left" projects current evaporation/depletion trend forward — a simplified stand-in for a full
          hydrological model, useful for flagging which reservoirs need attention first.
        </p>
      </div>

      <div className="card">
        <div className="section-title">Community Conservation Performance</div>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>
          Aggregated Water Health Scores across enrolled households can be rolled up here to identify which
          neighborhoods are responding well to conservation campaigns, and which need targeted outreach —
          turning individual household data into a scalable public-utility planning tool.
        </p>
      </div>
    </div>
  )
}
