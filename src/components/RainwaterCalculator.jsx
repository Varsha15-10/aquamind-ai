import { useMemo, useState } from 'react'
import { calculateRainwaterHarvest, INDIA_STATE_HOUSEHOLDS, estimateRWHMandateImpact } from '../data/simulateData.js'
import CountUp from './CountUp.jsx'

const HOUSE_TYPES = [
  { id: 'concrete', label: 'Concrete / RCC roof' },
  { id: 'tiled', label: 'Tiled roof' },
  { id: 'sloped_metal', label: 'Sloped metal / sheet roof' },
  { id: 'thatched', label: 'Thatched roof' },
]

export default function RainwaterCalculator() {
  const [roofAreaSqM, setRoofAreaSqM] = useState(100)
  const [houseType, setHouseType] = useState('concrete')
  const [city, setCity] = useState('Coimbatore')
  const [mandateState, setMandateState] = useState('Tamil Nadu')
  const [adoptionPct, setAdoptionPct] = useState(100)

  // Approximate annual rainfall (mm) by city across India — illustrative.
  const CITY_RAINFALL = {
    Coimbatore: 700,
    Chennai: 1400,
    Madurai: 850,
    Salem: 900,
    Trichy: 850,
    Tirunelveli: 750,
    Bengaluru: 970,
    Mumbai: 2200,
    Delhi: 790,
    Hyderabad: 810,
    Kolkata: 1850,
    Ahmedabad: 800,
    Jaipur: 570,
    Kochi: 2900,
  }

  const mandateProfile = useMemo(
    () => INDIA_STATE_HOUSEHOLDS.find((s) => s.state === mandateState) ?? INDIA_STATE_HOUSEHOLDS[0],
    [mandateState]
  )
  const mandateImpact = useMemo(
    () => estimateRWHMandateImpact({ ...mandateProfile, adoptionPct }),
    [mandateProfile, adoptionPct]
  )

  const result = useMemo(
    () => calculateRainwaterHarvest({ roofAreaSqM, houseType, annualRainfallMm: CITY_RAINFALL[city] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roofAreaSqM, houseType, city]
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Rainwater Harvesting Calculator</h1>
          <p>Estimate how much rainwater your roof can capture, and what storage you'd need.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Your Roof</div>

          <div className="field-row">
            <label>Roof area (sq. m)</label>
            <input
              type="number"
              min={10}
              max={1000}
              value={roofAreaSqM}
              onChange={(e) => setRoofAreaSqM(Math.max(0, Number(e.target.value)))}
              className="text-input"
            />
          </div>

          <div className="field-row">
            <label>Roof type</label>
            <select value={houseType} onChange={(e) => setHouseType(e.target.value)} className="text-input">
              {HOUSE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <label>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="text-input">
              {Object.keys(CITY_RAINFALL).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, marginBottom: 0 }}>
            Using ~{CITY_RAINFALL[city]}mm average annual rainfall for {city}.
          </p>
        </div>

        <div className="card">
          <div className="section-title">Predicted Harvest</div>
          <div className="stat-label">Annual rainwater harvest potential</div>
          <div className="stat-value" style={{ fontSize: 30, color: 'var(--aqua)' }}>
            <CountUp value={result.harvestLitersPerYear} suffix=" L / yr" />
          </div>

          <div className="grid grid-2" style={{ marginTop: 18, gap: 12 }}>
            <div>
              <div className="stat-label">Recommended storage tank</div>
              <div className="stat-value" style={{ fontSize: 20 }}>
                <CountUp value={result.storageRecommendedLiters} suffix=" L" />
              </div>
            </div>
            <div>
              <div className="stat-label">Estimated money saved / year</div>
              <div className="stat-value" style={{ fontSize: 20 }}>
                ₹<CountUp value={result.moneySavedPerYear} suffix="" />
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 16, marginBottom: 0 }}>
            Runoff coefficient of {result.coeff} applied for this roof type. Add a first-flush diverter and mesh
            filter to keep harvested water clean for household non-drinking use.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="section-title">🏛️ What If Rainwater Harvesting Were Mandated?</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0 }}>
          Several Indian states already require RWH structures for new buildings (e.g. Tamil Nadu's 2003
          mandate). Model the impact if a state made it compulsory for every household.
        </p>
        <div className="grid grid-2" style={{ gap: 16, marginTop: 6 }}>
          <div>
            <div className="field-row">
              <label>State / region</label>
              <select value={mandateState} onChange={(e) => setMandateState(e.target.value)} className="text-input">
                {INDIA_STATE_HOUSEHOLDS.map((s) => (
                  <option key={s.state} value={s.state}>{s.state}</option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <label>Adoption rate: {adoptionPct}%</label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={adoptionPct}
                onChange={(e) => setAdoptionPct(Number(e.target.value))}
                className="text-input"
              />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, marginBottom: 0 }}>
              Assumes ~{mandateProfile.households.toLocaleString('en-IN')} households, {mandateProfile.avgRoofAreaSqM}m²
              average roof, {mandateProfile.annualRainfallMm}mm annual rainfall, and 80% collection efficiency.
            </p>
          </div>
          <div>
            <div className="stat-label">Total water saved per year, statewide</div>
            <div className="stat-value" style={{ fontSize: 26, color: 'var(--aqua)' }}>
              <CountUp value={mandateImpact.totalMillionLitersPerYear} suffix=" Million L / yr" />
            </div>
            <div className="grid grid-2" style={{ marginTop: 14, gap: 12 }}>
              <div>
                <div className="stat-label">Per household / year</div>
                <div className="stat-value" style={{ fontSize: 18 }}>
                  <CountUp value={mandateImpact.perHouseholdLitersPerYear} suffix=" L" />
                </div>
              </div>
              <div>
                <div className="stat-label">Households covered</div>
                <div className="stat-value" style={{ fontSize: 18 }}>
                  {mandateImpact.householdsCovered.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
