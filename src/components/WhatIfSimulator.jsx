import { useMemo, useState } from 'react'
import { simulateWhatIf } from '../data/simulateData.js'
import CountUp from './CountUp.jsx'

export default function WhatIfSimulator() {
  const [showerMinutes, setShowerMinutes] = useState(10)
  const [laundryLoads, setLaundryLoads] = useState(5)
  const [gardenFrequency, setGardenFrequency] = useState(7) // sessions per week

  const result = useMemo(
    () =>
      simulateWhatIf({
        showerMinutesBefore: 10,
        showerMinutesAfter: showerMinutes,
        laundryLoadsBefore: 5,
        laundryLoadsAfter: laundryLoads,
        gardenFrequencyBefore: 7,
        gardenFrequencyAfter: gardenFrequency,
      }),
    [showerMinutes, laundryLoads, gardenFrequency]
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI "What If?" Simulator</h1>
          <p>Drag the sliders to see how small habit changes ripple into liters, money, CO₂, and your Water Health Score.</p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="section-title">Adjust Your Habits</div>

          <SliderRow
            label="Shower length"
            value={showerMinutes}
            min={1}
            max={15}
            unit="min"
            onChange={setShowerMinutes}
            note="was 10 min"
          />
          <SliderRow
            label="Laundry loads / week"
            value={laundryLoads}
            min={1}
            max={7}
            unit="loads"
            onChange={setLaundryLoads}
            note="was 5 loads"
          />
          <SliderRow
            label="Garden watering"
            value={gardenFrequency}
            min={0}
            max={7}
            unit="sessions/wk"
            onChange={setGardenFrequency}
            note="was daily (7)"
          />
        </div>

        <div className="card what-if-result">
          <div className="section-title">Predicted Impact — Per Month</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <ImpactStat icon="💧" label="Water saved" value={result.literSavedPerMonth} unit=" L" />
            <ImpactStat icon="💰" label="Money saved" value={result.moneySavedPerMonth} unit="" prefix="₹" />
            <ImpactStat icon="🌍" label="CO₂ reduced" value={result.co2ReducedKgPerMonth} unit=" kg" />
            <ImpactStat icon="📈" label="Score boost" value={result.scoreImprovement} unit=" pts" prefix="+" />
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 16, marginBottom: 0, lineHeight: 1.6 }}>
            Estimates use average fixture flow rates (9L/min shower, 65L/load laundry, 35L/session garden watering)
            and a municipal rate of ₹6 per 1,000L. Real savings vary by fixture and region.
          </p>
        </div>
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, unit, onChange, note }) {
  return (
    <div className="slider-row">
      <div className="slider-row-top">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="aqua-slider"
      />
      <span className="slider-note">{note}</span>
    </div>
  )
}

function ImpactStat({ icon, label, value, unit, prefix = '' }) {
  return (
    <div className="impact-stat">
      <div className="impact-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ fontSize: 22 }}>
          {prefix}<CountUp value={value} suffix={unit} />
        </div>
      </div>
    </div>
  )
}
