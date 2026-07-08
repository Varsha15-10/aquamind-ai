// Synthetic data generator: simulates extreme drought or flooding events
// so the platform's AI/response logic can be stress-tested in a sandbox.

const INTENSITY_FACTORS = {
  mild: 0.15,
  moderate: 0.35,
  severe: 0.6,
  extreme: 0.85,
}

export function generateScenarioDataset(scenarioType, intensity = 'moderate', durationDays = 7) {
  const factor = INTENSITY_FACTORS[intensity] ?? INTENSITY_FACTORS.moderate
  const dataset = []
  let baseSupply = 200 // liters/day baseline
  let baseDemand = 190

  for (let i = 0; i < durationDays; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)

    if (scenarioType === 'drought') {
      baseSupply *= (1 - factor * 0.06)          // supply steadily shrinks
      baseDemand *= (1 + factor * 0.03)          // demand creeps up (panic buying/storage)
      dataset.push({
        date: date.toISOString().slice(0, 10),
        supplyLiters: Math.max(20, Math.round(baseSupply)),
        demandLiters: Math.round(baseDemand),
        reservoirLevelPct: Math.max(2, Math.round(100 - i * factor * 12)),
        contaminationRisk: false,
      })
    } else {
      // flood
      const spike = Math.random() * factor * 300
      dataset.push({
        date: date.toISOString().slice(0, 10),
        supplyLiters: Math.round(baseSupply + spike),
        demandLiters: Math.round(baseDemand * (1 - factor * 0.1)),
        reservoirLevelPct: Math.min(100, Math.round(70 + i * factor * 8)),
        contaminationRisk: Math.random() < factor,
        infrastructureStrainPct: Math.min(100, Math.round(i * factor * 15)),
      })
    }
  }

  return dataset
}

export function buildStressTestPrompt(scenarioType, intensity, dataset) {
  const summary = JSON.stringify(dataset.slice(-3))
  return `SIMULATION MODE: A synthetic ${intensity} ${scenarioType} event is being stress-tested. ` +
    `Recent simulated data points: ${summary}. ` +
    `As the AI Water Advisor, give a short (3-5 sentence) emergency response recommendation ` +
    `for a municipal water team facing this scenario.`
}
