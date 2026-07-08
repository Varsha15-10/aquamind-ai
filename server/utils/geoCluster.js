// Geospatial clustering: buckets zones into a simple lat/lon grid and
// color-codes them by combined waste-score + leak-probability severity.

function severityColor(wasteScore, leakProbability) {
  const combined = wasteScore * 0.5 + leakProbability * 100 * 0.5
  if (combined >= 75) return { color: '#dc2626', label: 'critical' }   // red
  if (combined >= 50) return { color: '#f97316', label: 'high' }       // orange
  if (combined >= 25) return { color: '#eab308', label: 'moderate' }   // yellow
  return { color: '#16a34a', label: 'low' }                            // green
}

// Groups zones into coarse grid cells (~0.05 degrees, roughly 5km) so nearby
// hotspots visually merge on the heatmap instead of rendering as isolated pins.
export function buildHeatmap(zones, gridSize = 0.05) {
  const clusters = new Map()

  for (const zone of zones) {
    const cellLat = Math.round(zone.lat / gridSize) * gridSize
    const cellLon = Math.round(zone.lon / gridSize) * gridSize
    const key = `${cellLat.toFixed(3)},${cellLon.toFixed(3)}`

    if (!clusters.has(key)) {
      clusters.set(key, { lat: cellLat, lon: cellLon, zones: [] })
    }
    clusters.get(key).zones.push(zone)
  }

  return Array.from(clusters.values()).map((cluster) => {
    const avgWaste = cluster.zones.reduce((a, z) => a + z.wasteScore, 0) / cluster.zones.length
    const avgLeak = cluster.zones.reduce((a, z) => a + z.leakProbability, 0) / cluster.zones.length
    const { color, label } = severityColor(avgWaste, avgLeak)

    return {
      lat: cluster.lat,
      lon: cluster.lon,
      zoneCount: cluster.zones.length,
      zoneNames: cluster.zones.map((z) => z.name),
      avgWasteScore: +avgWaste.toFixed(1),
      avgLeakProbability: +avgLeak.toFixed(3),
      severity: label,
      color,
    }
  })
}
