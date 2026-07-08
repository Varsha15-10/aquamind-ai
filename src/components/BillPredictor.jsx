import { useMemo } from 'react'
import { generateUsageHistory, predictBill } from '../data/simulateData.js'
import CountUp from './CountUp.jsx'

export default function BillPredictor() {
  const history = useMemo(() => generateUsageHistory(14), [])
  const avgLitersPerDay = Math.round(history.reduce((a, b) => a + b.liters, 0) / history.length)
  const bill = useMemo(() => predictBill({ litersPerDay: avgLitersPerDay }), [avgLitersPerDay])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Bill Predictor</h1>
          <p>Forecast your next water bill, and see what's possible if you follow your conservation plan.</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <BillStat label="Current month" value={bill.currentBill} highlight={false} />
        <BillStat label="Next month (trend)" value={bill.nextMonthBill} highlight={false} warn />
        <BillStat label="After conservation plan" value={bill.afterConservationBill} highlight />
        <BillStat label="Potential savings" value={bill.savings} highlight prefix="−" />
      </div>

      <div className="card">
        <div className="section-title">How This Is Calculated</div>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>
          Based on your 14-day average usage of {avgLitersPerDay}L/day (~{Math.round((avgLitersPerDay * 30) / 1000)}
          kL/month) at an illustrative municipal rate of ₹6 per 1,000L. "Next month" assumes a mild 4% seasonal
          uptick if habits stay the same. "After conservation plan" assumes following your Weekly Action Plan
          cuts usage by about 15%.
        </p>
      </div>
    </div>
  )
}

function BillStat({ label, value, highlight, warn, prefix = '' }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div
        className="stat-value"
        style={{ color: highlight ? 'var(--mint)' : warn ? 'var(--amber)' : 'var(--text-primary)' }}
      >
        {prefix}₹<CountUp value={value} suffix="" />
      </div>
    </div>
  )
}
