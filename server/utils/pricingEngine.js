// Dynamic pricing engine: surges water rates for bulk/industrial users
// automatically during periods of regional water scarcity.

export const BASE_RATES = {
  residential: 0.03,  // currency units per liter
  commercial: 0.06,
  industrial: 0.09,
  bulk: 0.12,
}

// Multiplier is only applied in full to commercial/industrial/bulk users —
// residential users get a heavily dampened surge to protect households.
const RESIDENTIAL_DAMPING = 0.25

export function calculateRate(userType, scarcity) {
  const type = BASE_RATES[userType] ? userType : 'residential'
  const base = BASE_RATES[type]
  const multiplier = scarcity?.multiplier || 1.0

  const effectiveMultiplier = type === 'residential'
    ? 1 + (multiplier - 1) * RESIDENTIAL_DAMPING
    : multiplier

  const rate = +(base * effectiveMultiplier).toFixed(4)

  return {
    userType: type,
    baseRate: base,
    scarcityLevel: scarcity?.level || 'normal',
    multiplierApplied: +effectiveMultiplier.toFixed(2),
    currentRate: rate,
  }
}

export function levelToMultiplier(level) {
  switch (level) {
    case 'moderate': return 1.25
    case 'severe': return 1.6
    case 'critical': return 2.2
    default: return 1.0
  }
}
