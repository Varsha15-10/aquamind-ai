import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  INDIA_WATER_BODIES,
  WATER_BODY_TYPES,
  getGateStatus,
  predictNextWeekReserve,
  predictNationalReserveOutlook,
  getCurrentSeason,
} from '../data/simulateData.js'

// India approximate center
const INDIA_CENTER = [22.9, 79.5]

function FlyToBody({ body }) {
  const map = useMap()
  if (body) {
    map.flyTo([body.lat, body.lng], 8, { duration: 0.8 })
  }
  return null
}

export default function SatelliteMonitor() {
  const [selected, setSelected] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')

  const season = useMemo(() => getCurrentSeason(), [])
  const outlook = useMemo(() => predictNationalReserveOutlook(INDIA_WATER_BODIES, season), [season])

  const states = useMemo(
    () => ['all', ...Array.from(new Set(INDIA_WATER_BODIES.map((w) => w.state))).sort()],
    []
  )

  const filtered = useMemo(
    () =>
      INDIA_WATER_BODIES.filter(
        (w) => (typeFilter === 'all' || w.type === typeFilter) && (stateFilter === 'all' || w.state === stateFilter)
      ),
    [typeFilter, stateFilter]
  )

  const storageBodies = filtered.filter((w) => w.type !== 'river')
  const totalFull = storageBodies.reduce((a, w) => a + w.fullCapacityKm2, 0)
  const totalCurrent = storageBodies.reduce((a, w) => a + w.currentSurfaceAreaKm2, 0)
  const totalEvap = storageBodies.reduce((a, w) => a + w.dailyEvaporationML, 0)
  const pctFull = totalFull === 0 ? 0 : Math.round((totalCurrent / totalFull) * 100)
  const gatesOpenCount = storageBodies.filter((w) => getGateStatus(w).level === 'open').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Satellite Water-Body Monitor — India</h1>
          <p>Tracking dams, lakes, ponds/tanks, and rivers across India — zoom, pan, and click a marker for details.</p>
        </div>
        <span className="pill warn">▼ {pctFull}% of full capacity, filtered view</span>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">🌦️ Climate-Aware Next-Week Reserve Outlook</div>
        <div className="grid grid-4">
          <MiniStat label="Current season" value={outlook.season} />
          <MiniStat label="National reserve now" value={`${outlook.currentPctFull}% full`} />
          <MiniStat
            label="Projected in 7 days"
            value={`${outlook.projectedPctFull}% full`}
            negative={outlook.projectedPctFull < outlook.currentPctFull}
          />
          <MiniStat
            label="Expected change"
            value={`${outlook.pctChange >= 0 ? '+' : ''}${outlook.pctChange}%`}
            negative={outlook.pctChange < 0}
          />
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 14, marginBottom: 0 }}>
          Modeled from each water body's weekly trend, adjusted for the current climate season's evaporation rate
          and expected rainfall inflow (production version would use IMD 7-day rainfall forecasts + CWC data).
        </p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="stat-label">Water bodies tracked</div>
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-delta">Of {INDIA_WATER_BODIES.length} nationwide</div>
        </div>
        <div className="card">
          <div className="stat-label">Estimated evaporation loss</div>
          <div className="stat-value">{totalEvap.toFixed(1)} ML/day</div>
          <div className="stat-delta" style={{ color: 'var(--rose)' }}>Million liters lost daily</div>
        </div>
        <div className="card">
          <div className="stat-label">Dam gates OPEN right now</div>
          <div className="stat-value" style={{ color: gatesOpenCount > 0 ? 'var(--rose)' : 'var(--mint)' }}>{gatesOpenCount}</div>
          <div className="stat-delta">Flood-release status</div>
        </div>
        <div className="card">
          <div className="stat-label">States / UTs covered</div>
          <div className="stat-value">{states.length - 1}</div>
          <div className="stat-delta">Pan-India coverage</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="filter-row">
          <div className="filter-group">
            {WATER_BODY_TYPES.map((t) => (
              <button
                key={t.id}
                className={`filter-pill ${typeFilter === t.id ? 'active' : ''}`}
                onClick={() => setTypeFilter(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="text-input" style={{ maxWidth: 220 }}>
            {states.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All States / UTs' : s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18, padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 460 }}>
          <MapContainer center={INDIA_CENTER} zoom={5} style={{ height: '100%', width: '100%', background: '#0b1e27' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            <FlyToBody body={selected} />
            {filtered.map((w) => {
              const isRiver = w.type === 'river'
              const pctOfFull = isRiver ? null : w.currentSurfaceAreaKm2 / w.fullCapacityKm2
              const color = isRiver
                ? w.flowStatus === 'Normal' ? '#34d399' : '#fb5779'
                : pctOfFull > 0.75 ? '#34d399' : pctOfFull > 0.5 ? '#f5a524' : '#fb5779'
              const radius = isRiver ? 7 : 6 + pctOfFull * 10
              return (
                <CircleMarker
                  key={w.id}
                  center={[w.lat, w.lng]}
                  radius={radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.55, weight: 2 }}
                  eventHandlers={{ click: () => setSelected(w) }}
                >
                  <Popup>
                    <strong>{w.name}</strong> ({w.state})<br />
                    {isRiver ? (
                      <>Flow: {w.flowCumecs} cumecs — {w.flowStatus}<br /></>
                    ) : (
                      <>
                        Surface area: {w.currentSurfaceAreaKm2} km² / {w.fullCapacityKm2} km² full<br />
                        Evaporation: ~{w.dailyEvaporationML} ML/day<br />
                      </>
                    )}
                    Trend: {w.trend}% per week
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
      </div>

      {selected ? (
        <WaterBodyDetail body={selected} season={season} />
      ) : (
        <div className="card">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Click any marker on the map above to see detailed stats, dam gate status, and a climate-adjusted
            7-day forecast for that water body. Marker size and color reflect fullness/flow health — green is
            healthy, amber is moderate, red signals concern.
          </p>
        </div>
      )}
    </div>
  )
}

function WaterBodyDetail({ body, season }) {
  const forecast = predictNextWeekReserve(body, season)
  const gate = getGateStatus(body)
  const isRiver = body.type === 'river'

  return (
    <div className="card">
      <div className="section-title">
        {body.name} — {body.state}
        {!isRiver && <span className={`pill ${gate.className}`} style={{ marginLeft: 10 }}>{gate.label}</span>}
      </div>

      <div className="grid grid-4">
        {isRiver ? (
          <>
            <MiniStat label="Current flow" value={`${body.flowCumecs} cumecs`} />
            <MiniStat label="Flow status" value={body.flowStatus} negative={body.flowStatus !== 'Normal'} />
            <MiniStat label="Weekly trend" value={`${body.trend}%`} negative={body.trend < 0} />
            <MiniStat
              label="Projected flow, next week"
              value={`${forecast.projectedFlowCumecs} cumecs`}
              negative={forecast.pctChange < 0}
            />
          </>
        ) : (
          <>
            <MiniStat label="Current surface area" value={`${body.currentSurfaceAreaKm2} km²`} />
            <MiniStat label="Full capacity area" value={`${body.fullCapacityKm2} km²`} />
            <MiniStat label="Daily evaporation" value={`${body.dailyEvaporationML} ML`} />
            <MiniStat label="Weekly trend" value={`${body.trend}%`} negative={body.trend < 0} />
          </>
        )}
      </div>

      {!isRiver && (
        <div className="grid grid-2" style={{ marginTop: 16, gap: 12 }}>
          <div>
            <div className="stat-label">Projected in 7 days ({forecast.season})</div>
            <div className="stat-value" style={{ fontSize: 20 }}>
              {forecast.projectedAreaKm2} km² ({forecast.projectedPctFull}% full)
            </div>
          </div>
          <div>
            <div className="stat-label">Expected weekly change</div>
            <div className="stat-value" style={{ fontSize: 20, color: forecast.pctChange < 0 ? 'var(--rose)' : 'var(--mint)' }}>
              {forecast.pctChange >= 0 ? '+' : ''}{forecast.pctChange}%
            </div>
          </div>
        </div>
      )}

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 14, marginBottom: 0 }}>
        Figures are simulated for this demo. In production, surface area and evaporation would be computed
        from Sentinel-2 satellite imagery (NDWI index) via the free Google Earth Engine API, cross-referenced
        with IMD rainfall/temperature data. Dam gate status is a rule-of-thumb model (open ≥95% full, standby
        ≥85%) mirroring real spillway-gate operating protocol.
      </p>
    </div>
  )
}

function MiniStat({ label, value, negative }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ fontSize: 18, color: negative ? 'var(--rose)' : 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  )
}
