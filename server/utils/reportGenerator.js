// Automated report generator: compiles environmental compliance, ESG scoring,
// and daily water-audit metrics into a structured report the frontend can
// render as a one-click PDF (via jspdf, already used client-side).

export function buildComplianceReport({ reportType, usageRecords = [], alerts = [], periodStart, periodEnd }) {
  const totalLiters = usageRecords.reduce((a, r) => a + r.liters, 0)
  const avgDailyLiters = usageRecords.length ? Math.round(totalLiters / usageRecords.length) : 0
  const leakAlerts = alerts.filter((a) => a.type === 'leak')
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved')

  const complianceScore = Math.max(0, Math.min(100, Math.round(
    100 - (leakAlerts.length * 4) - (avgDailyLiters > 250 ? (avgDailyLiters - 250) / 5 : 0)
  )))

  const esgScore = Math.max(0, Math.min(100, Math.round(
    (complianceScore * 0.6) + ((resolvedAlerts.length / Math.max(1, alerts.length)) * 100 * 0.4)
  )))

  const base = {
    reportType,
    periodStart,
    periodEnd,
    generatedAt: new Date().toISOString(),
    metrics: {
      totalLitersUsed: totalLiters,
      averageDailyLiters: avgDailyLiters,
      totalAlerts: alerts.length,
      leakAlerts: leakAlerts.length,
      resolvedAlerts: resolvedAlerts.length,
      complianceScore,
    },
  }

  if (reportType === 'esg') {
    base.metrics.esgScore = esgScore
    base.metrics.esgRating = esgScore >= 80 ? 'A' : esgScore >= 60 ? 'B' : esgScore >= 40 ? 'C' : 'D'
  }

  if (reportType === 'daily_audit') {
    base.metrics.auditNotes = leakAlerts.length > 0
      ? `${leakAlerts.length} leak event(s) detected in this period — review flagged assets.`
      : 'No leak events detected in this period.'
  }

  return base
}
