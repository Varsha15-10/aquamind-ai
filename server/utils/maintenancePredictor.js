// Predictive maintenance: flags pipes/pumps likely to fail in the next 30 days
// based on flow degradation trends (simple linear regression over recent readings).

function linearRegressionSlope(points) {
  const n = points.length
  if (n < 2) return 0
  const xs = points.map((_, i) => i)
  const ys = points
  const xMean = xs.reduce((a, b) => a + b, 0) / n
  const yMean = ys.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean)
    den += (xs[i] - xMean) ** 2
  }
  return den === 0 ? 0 : num / den
}

export function predictAssetRisk(asset) {
  const readings = [...(asset.flowReadings || [])].sort((a, b) => new Date(a.date) - new Date(b.date))

  if (readings.length < 3) {
    return {
      riskScore: 0,
      riskLevel: 'low',
      predictedFailureInDays: null,
      note: 'Not enough flow readings yet (need at least 3) to predict degradation trend.',
    }
  }

  const flows = readings.map((r) => r.flowRate)
  const slope = linearRegressionSlope(flows) // negative slope = declining flow = degradation
  const baseline = flows[0]
  const latest = flows[flows.length - 1]
  const pctDrop = baseline === 0 ? 0 : ((baseline - latest) / baseline) * 100

  // Risk score blends the rate of decline with how far it has already dropped.
  const declineSeverity = Math.max(0, -slope) * 8
  const dropSeverity = Math.max(0, pctDrop)
  let riskScore = Math.round(Math.min(100, declineSeverity + dropSeverity))

  let riskLevel = 'low'
  if (riskScore >= 75) riskLevel = 'critical'
  else if (riskScore >= 50) riskLevel = 'high'
  else if (riskScore >= 25) riskLevel = 'medium'

  // Rough projection: days until flow would hit a critical failure threshold (40% of baseline),
  // assuming the current linear trend continues.
  let predictedFailureInDays = null
  if (slope < 0) {
    const failureFlow = baseline * 0.4
    const stepsToFailure = (latest - failureFlow) / -slope
    predictedFailureInDays = stepsToFailure > 0 ? Math.round(stepsToFailure) : 0
    if (predictedFailureInDays > 365) predictedFailureInDays = null // not meaningfully "soon"
  }

  return {
    riskScore,
    riskLevel,
    predictedFailureInDays,
    note: `Flow has ${pctDrop >= 0 ? 'dropped' : 'risen'} ${Math.abs(pctDrop).toFixed(1)}% since the first reading in this trend window.`,
  }
}
