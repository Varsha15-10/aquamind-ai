// Simulated smart-meter data generator.
// In production this would be replaced by real IoT sensor / utility API feeds.

export function generateUsageHistory(days = 14) {
  const data = []
  let base = 180
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const weekday = date.getDay()
    const weekendBump = weekday === 0 || weekday === 6 ? 25 : 0
    const noise = Math.random() * 20 - 10
    const value = Math.max(60, Math.round(base + weekendBump + noise))
    data.push({
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      liters: value,
    })
    base += Math.random() * 4 - 2
  }
  return data
}

export function generateForecast(history, futureDays = 7) {
  const avg = history.reduce((a, b) => a + b.liters, 0) / history.length
  const trend = (history[history.length - 1].liters - history[0].liters) / history.length
  const forecast = []
  for (let i = 1; i <= futureDays; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const predicted = Math.max(50, Math.round(avg + trend * i + (Math.random() * 10 - 5)))
    forecast.push({
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      liters: predicted,
    })
  }
  return forecast
}

// Simple anomaly / leak detection: flags a reading if it deviates
// far beyond normal range (stand-in for the real Isolation Forest / CNN model).
export function detectLeak(history) {
  const values = history.map((h) => h.liters)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  const stdDev = Math.sqrt(variance)
  const last = values[values.length - 1]
  const zScore = stdDev === 0 ? 0 : (last - mean) / stdDev
  const isLeak = zScore > 1.8
  return {
    isLeak,
    confidence: Math.min(0.99, Math.abs(zScore) / 3).toFixed(2),
    zScore: zScore.toFixed(2),
    lastReading: last,
    mean: Math.round(mean),
  }
}

export function simulateLeakSpike(history) {
  const spiked = [...history]
  const spikeValue = Math.round(spiked[spiked.length - 1].liters * 2.6)
  spiked[spiked.length - 1] = { ...spiked[spiked.length - 1], liters: spikeValue }
  return spiked
}

export function computeCreditScore(history) {
  const avg = history.reduce((a, b) => a + b.liters, 0) / history.length
  // Lower usage relative to a 220L/day baseline = higher score (0-100)
  const baseline = 220
  const ratio = baseline / avg
  const score = Math.max(35, Math.min(98, Math.round(ratio * 65)))
  return score
}

// Splits total daily usage into realistic everyday-activity categories.
const ACTIVITY_SHARES = [
  { name: 'Bathing / Showering', icon: '🚿', share: 0.32, tip: 'Cutting shower time by 2 minutes can save ~20L per person, per day.' },
  { name: 'Toilet Flushing', icon: '🚽', share: 0.24, tip: 'A dual-flush or displacement bag can cut usage by 1-2L per flush.' },
  { name: 'Laundry', icon: '👕', share: 0.16, tip: 'Running only full loads can save ~15L per wash cycle.' },
  { name: 'Cleaning Utensils', icon: '🍽️', share: 0.12, tip: 'Scraping plates before washing and using a basin saves ~10L per session.' },
  { name: 'Brushing / Handwashing', icon: '🪥', share: 0.08, tip: 'Turning off the tap while brushing saves up to 6L per person, per day.' },
  { name: 'Cooking & Drinking', icon: '🍲', share: 0.05, tip: 'Reusing vegetable-rinse water for plants saves a few liters daily.' },
  { name: 'Garden / Cleaning', icon: '🪣', share: 0.03, tip: 'Watering at dawn or dusk cuts evaporation loss by up to 30%.' },
]

export function generateActivityBreakdown(totalLiters) {
  return ACTIVITY_SHARES.map((a) => ({
    ...a,
    liters: Math.round(totalLiters * a.share),
  })).sort((a, b) => b.liters - a.liters)
}

// Real Tamil Nadu reservoirs/dams with approximate coordinates.
// Surface area, evaporation, and trend figures are simulated for demo purposes
// (in production these would come from satellite NDWI analysis + weather data).
export const TAMIL_NADU_RESERVOIRS = [
  {
    id: 'mettur',
    name: 'Mettur Dam',
    district: 'Salem',
    lat: 11.7867,
    lng: 77.8039,
    fullCapacityKm2: 40.3,
    currentSurfaceAreaKm2: 31.2,
    dailyEvaporationML: 4.8,
    trend: -0.6,
  },
  {
    id: 'vaigai',
    name: 'Vaigai Dam',
    district: 'Theni',
    lat: 9.9500,
    lng: 77.4667,
    fullCapacityKm2: 6.8,
    currentSurfaceAreaKm2: 4.1,
    dailyEvaporationML: 1.2,
    trend: -0.9,
  },
  {
    id: 'bhavanisagar',
    name: 'Bhavanisagar Dam',
    district: 'Erode',
    lat: 11.4667,
    lng: 77.1167,
    fullCapacityKm2: 78.0,
    currentSurfaceAreaKm2: 52.4,
    dailyEvaporationML: 6.1,
    trend: -1.1,
  },
  {
    id: 'krishnagiri',
    name: 'Krishnagiri Dam',
    district: 'Krishnagiri',
    lat: 12.5386,
    lng: 78.1957,
    fullCapacityKm2: 12.5,
    currentSurfaceAreaKm2: 7.8,
    dailyEvaporationML: 1.6,
    trend: -0.4,
  },
  {
    id: 'amaravathi',
    name: 'Amaravathi Dam',
    district: 'Tiruppur',
    lat: 10.3833,
    lng: 77.2333,
    fullCapacityKm2: 9.1,
    currentSurfaceAreaKm2: 5.3,
    dailyEvaporationML: 1.0,
    trend: -0.7,
  },
  {
    id: 'poondi',
    name: 'Poondi Reservoir',
    district: 'Tiruvallur',
    lat: 13.2333,
    lng: 79.9333,
    fullCapacityKm2: 14.6,
    currentSurfaceAreaKm2: 9.9,
    dailyEvaporationML: 2.3,
    trend: -1.4,
  },
  {
    id: 'sholayar',
    name: 'Sholayar Dam',
    district: 'Coimbatore',
    lat: 10.3000,
    lng: 76.7333,
    fullCapacityKm2: 7.3,
    currentSurfaceAreaKm2: 6.0,
    dailyEvaporationML: 0.8,
    trend: -0.2,
  },
]

export const leaderboardSeed = [
  { name: 'Rina P.', score: 94 },
  { name: 'You', score: null }, // filled dynamically
  { name: 'Amit K.', score: 88 },
  { name: 'Green Valley Apts', score: 81 },
  { name: 'Tom H.', score: 76 },
]

// ============================================================
// NEW FEATURE DATA & LOGIC
// ============================================================

// ---------- 1. Water Health Score ----------
// Composite score blending usage, leak risk, habits, forecast trend, and
// community standing. Each component is 0-100; weights sum to 1.
export function computeWaterHealthScore({ history, leak, forecast, creditScore, communityScore = 82 }) {
  const baseline = 220
  const today = history[history.length - 1].liters
  const usageComponent = Math.max(0, Math.min(100, Math.round((baseline / today) * 70)))

  const leakComponent = leak.isLeak ? Math.max(10, Math.round(100 - leak.confidence * 100)) : 100

  const habitsComponent = creditScore

  const forecastAvg = forecast.reduce((a, b) => a + b.liters, 0) / forecast.length
  const historyAvg = history.reduce((a, b) => a + b.liters, 0) / history.length
  const forecastComponent = Math.max(0, Math.min(100, Math.round(100 - ((forecastAvg - historyAvg) / historyAvg) * 200)))

  const weights = { usage: 0.3, leak: 0.2, habits: 0.2, forecast: 0.15, community: 0.15 }
  const score = Math.round(
    usageComponent * weights.usage +
    leakComponent * weights.leak +
    habitsComponent * weights.habits +
    forecastComponent * weights.forecast +
    communityScore * weights.community
  )

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: [
      { label: 'Water usage', value: usageComponent, weight: weights.usage },
      { label: 'Leak probability', value: leakComponent, weight: weights.leak },
      { label: 'Conservation habits', value: habitsComponent, weight: weights.habits },
      { label: 'Forecast trend', value: forecastComponent, weight: weights.forecast },
      { label: 'Community contribution', value: communityScore, weight: weights.community },
    ],
  }
}

// Deterministic "why did my score change" explanation using real numbers,
// mirroring what a natural-language AI layer would say.
export function explainScoreChange(history) {
  const today = history[history.length - 1].liters
  const yesterday = history[history.length - 2]?.liters ?? today
  const pctChange = yesterday === 0 ? 0 : Math.round(((today - yesterday) / yesterday) * 100)
  const activities = generateActivityBreakdown(today)
  const topActivity = activities[0]

  if (pctChange > 5) {
    return `Your score dropped because total usage rose ${pctChange}% versus yesterday. ${topActivity.name} is your single largest category today at ${topActivity.liters}L (${Math.round((topActivity.liters / today) * 100)}% of the total) — that's the best place to cut back first.`
  }
  if (pctChange < -5) {
    return `Your score improved because total usage fell ${Math.abs(pctChange)}% versus yesterday. Keep an eye on ${topActivity.name}, still your largest category at ${topActivity.liters}L — trimming it further would push your score even higher.`
  }
  return `Your usage held steady versus yesterday (${pctChange >= 0 ? '+' : ''}${pctChange}%). ${topActivity.name} remains your largest category at ${topActivity.liters}L, about ${Math.round((topActivity.liters / today) * 100)}% of today's total.`
}

// ---------- 2. "What If?" Simulator ----------
const WHAT_IF_RATES = {
  literPerMinuteShower: 9,
  literPerLoadLaundry: 65,
  literPerGardenSession: 35,
  ratePerKL: 6, // currency per 1000L, illustrative
  co2PerKL: 0.35, // kg CO2 per 1000L (treatment + pumping energy), illustrative
}

export function simulateWhatIf({ showerMinutesBefore, showerMinutesAfter, laundryLoadsBefore, laundryLoadsAfter, gardenFrequencyBefore, gardenFrequencyAfter }) {
  const showerSavedPerDay = Math.max(0, (showerMinutesBefore - showerMinutesAfter) * WHAT_IF_RATES.literPerMinuteShower)
  const laundrySavedPerWeek = Math.max(0, (laundryLoadsBefore - laundryLoadsAfter) * WHAT_IF_RATES.literPerLoadLaundry)
  // gardenFrequency: 7 = daily, 3.5 = alternate days, etc. (sessions per week)
  const gardenSavedPerWeek = Math.max(0, (gardenFrequencyBefore - gardenFrequencyAfter) * WHAT_IF_RATES.literPerGardenSession)

  const literSavedPerMonth = Math.round(showerSavedPerDay * 30 + (laundrySavedPerWeek + gardenSavedPerWeek) * 4.33)
  const moneySavedPerMonth = Math.round((literSavedPerMonth / 1000) * WHAT_IF_RATES.ratePerKL)
  const co2ReducedKgPerMonth = Math.round((literSavedPerMonth / 1000) * WHAT_IF_RATES.co2PerKL * 10) / 10
  const scoreImprovement = Math.min(15, Math.round(literSavedPerMonth / 400))

  return { literSavedPerMonth, moneySavedPerMonth, co2ReducedKgPerMonth, scoreImprovement }
}

// ---------- 3. AI Weekly Action Plan ----------
export const WEEKLY_PLAN_TEMPLATE = [
  { day: 'Monday', task: 'Reduce shower time by 2 minutes', icon: '🚿', savings: 20 },
  { day: 'Tuesday', task: 'Reuse RO / rinse wastewater for plants', icon: '♻️', savings: 8 },
  { day: 'Wednesday', task: 'Run the washing machine only when full', icon: '🧺', savings: 15 },
  { day: 'Thursday', task: 'Check and fix the kitchen tap', icon: '🔧', savings: 10 },
  { day: 'Friday', task: 'Water the garden at dawn or dusk only', icon: '🌱', savings: 12 },
  { day: 'Saturday', task: 'Do the 2-hour meter test for hidden leaks', icon: '🔍', savings: 0 },
  { day: 'Sunday', task: 'Family water-saving challenge', icon: '🏆', savings: 25 },
]

// ---------- 4. Family Mode ----------
export const FAMILY_MEMBERS_SEED = [
  { name: 'Dad', share: 0.29 },
  { name: 'Mom', share: 0.24 },
  { name: 'Brother', share: 0.25 },
  { name: 'You', share: 0.22 },
]

export function generateFamilyUsage(totalLiters) {
  return FAMILY_MEMBERS_SEED
    .map((m) => ({ ...m, liters: Math.round(totalLiters * m.share) }))
    .sort((a, b) => b.liters - a.liters)
}

export const FAMILY_WEEKLY_GOAL_LITERS = 200

// ---------- 5. Leak Probability Meter ----------
export function leakProbabilityLevel(confidence) {
  const pct = Number(confidence) * 100
  if (pct >= 60) return { level: 'High', color: '🔴', className: 'danger' }
  if (pct >= 25) return { level: 'Medium', color: '🟡', className: 'warn' }
  return { level: 'Low', color: '🟢', className: 'ok' }
}

// ---------- 7. District Water Ranking ----------
export const TN_DISTRICT_EFFICIENCY = [
  { city: 'Coimbatore', efficiency: 88 },
  { city: 'Salem', efficiency: 79 },
  { city: 'Tirunelveli', efficiency: 75 },
  { city: 'Madurai', efficiency: 73 },
  { city: 'Trichy', efficiency: 69 },
  { city: 'Chennai', efficiency: 64 },
].sort((a, b) => b.efficiency - a.efficiency)
  .map((d, i) => ({ ...d, rank: i + 1 }))

// ---------- 8. Emergency Water Mode ----------
export const EMERGENCY_PER_PERSON_LIMITS = { mild: 135, moderate: 100, severe: 70 }

export function computeEmergencyBudget({ householdSize = 4, severity = 'moderate' }) {
  const perPerson = EMERGENCY_PER_PERSON_LIMITS[severity] ?? EMERGENCY_PER_PERSON_LIMITS.moderate
  const dailyLimit = householdSize * perPerson
  const essential = Math.round(dailyLimit * 0.65)
  const nonEssential = dailyLimit - essential
  return { dailyLimit, essential, nonEssential, perPerson }
}

// ---------- 9. AI Rainwater Calculator ----------
const RUNOFF_COEFFICIENTS = { concrete: 0.85, tiled: 0.75, sloped_metal: 0.9, thatched: 0.55 }

export function calculateRainwaterHarvest({ roofAreaSqM, houseType = 'concrete', annualRainfallMm = 900 }) {
  const coeff = RUNOFF_COEFFICIENTS[houseType] ?? 0.75
  const harvestLitersPerYear = Math.round(roofAreaSqM * (annualRainfallMm / 1000) * coeff * 1000)
  const storageRecommendedLiters = Math.round((harvestLitersPerYear / 12) * 1.5)
  const moneySavedPerYear = Math.round((harvestLitersPerYear / 1000) * 45)
  return { harvestLitersPerYear, storageRecommendedLiters, moneySavedPerYear, coeff }
}

// ---------- 10 & 12. Daily Missions ----------
export const MISSION_POOL = [
  { text: 'Turn off the tap while brushing your teeth', icon: '🪥', savingsLiters: 6 },
  { text: 'Take a shower 2 minutes shorter than usual', icon: '🚿', savingsLiters: 20 },
  { text: 'Run the washing machine only when it is full', icon: '🧺', savingsLiters: 15 },
  { text: 'Fix or report a dripping tap today', icon: '🔧', savingsLiters: 10 },
  { text: 'Reuse RO reject / rinse water for your plants', icon: '♻️', savingsLiters: 8 },
  { text: 'Water the garden at dawn or dusk, not midday', icon: '🌱', savingsLiters: 12 },
  { text: 'Wash the car with a bucket, not a running hose', icon: '🚗', savingsLiters: 100 },
]

export function getTodaysMission() {
  const dayIndex = new Date().getDate() % MISSION_POOL.length
  return MISSION_POOL[dayIndex]
}

// ---------- 11. Achievement Badges ----------
export const BADGE_DEFS = [
  { id: 'leak-hunter', icon: '💧', name: 'Leak Hunter', desc: 'Detected a leak signal early', check: (ctx) => ctx.leakDetectedEver },
  { id: 'eco-hero', icon: '🌱', name: 'Eco Hero', desc: 'Water Health Score of 85+', check: (ctx) => ctx.score >= 85 },
  { id: 'water-champion', icon: '🏆', name: 'Water Champion', desc: 'Top 20% on the community leaderboard', check: (ctx) => ctx.percentile <= 20 },
  { id: 'shower-saver', icon: '🚿', name: 'Shower Saver', desc: 'Shower usage under 45L today', check: (ctx) => ctx.showerLiters <= 45 },
  { id: 'water-recycler', icon: '♻️', name: 'Water Recycler', desc: 'No leak flagged in the last 14 days', check: (ctx) => !ctx.leak?.isLeak },
]

export function evaluateBadges(ctx) {
  return BADGE_DEFS.map((b) => ({ ...b, unlocked: Boolean(b.check(ctx)) }))
}

// ---------- 12. AI Household Comparison ----------
export function compareToSimilarHouseholds(userLiters, familySize = 4) {
  const avgSimilar = 243
  const diffPct = Math.round(((avgSimilar - userLiters) / avgSimilar) * 100)
  const percentile = diffPct > 25 ? 12 : diffPct > 15 ? 18 : diffPct > 5 ? 30 : diffPct > -5 ? 50 : 72
  return { avgSimilar, diffPct, percentile, familySize }
}

// ---------- 13. AI Bill Predictor ----------
export function predictBill({ litersPerDay, ratePerKL = 6, afterConservationPct = 15 }) {
  const monthlyKL = (litersPerDay * 30) / 1000
  const currentBill = Math.round(monthlyKL * ratePerKL)
  const nextMonthBill = Math.round(currentBill * 1.04)
  const afterConservationBill = Math.round(currentBill * (1 - afterConservationPct / 100))
  const savings = currentBill - afterConservationBill
  return { currentBill, nextMonthBill, afterConservationBill, savings }
}

// ---------- 14. NGO / Government Portal ----------
export const NGO_ZONE_DATA = [
  { zone: 'Ward 4 – Peelamedu', consumptionMLD: 3.2, status: 'High consumption', reservoirLinked: 'Sholayar Dam' },
  { zone: 'Ward 9 – RS Puram', consumptionMLD: 2.1, status: 'Normal', reservoirLinked: 'Sholayar Dam' },
  { zone: 'Ward 14 – Saibaba Colony', consumptionMLD: 2.8, status: 'High consumption', reservoirLinked: 'Sholayar Dam' },
  { zone: 'Ward 22 – Singanallur', consumptionMLD: 1.6, status: 'Normal', reservoirLinked: 'Sholayar Dam' },
]

export function forecastShortageWeeks(reservoir) {
  if (reservoir.trend >= 0) return null
  const weeksLeft = Math.round((reservoir.currentSurfaceAreaKm2 / Math.abs(reservoir.trend / 100)) / 4)
  return Math.max(1, Math.min(52, weeksLeft))
}

// ============================================================
// NEW FEATURES BATCH 2
// Pan-India water-body coverage, climate-aware forecasting, dam gate
// logic, hourly live refresh, RWH mandate impact, and drought planning.
// All figures below are illustrative/simulated for demo purposes — in
// production these would come from IMD climate data, CWC reservoir
// bulletins, and Sentinel-2 NDWI satellite analysis.
// ============================================================

// ---------- 15. Pan-India Water Bodies (dams, lakes, rivers, ponds/tanks) ----------
// Tamil Nadu dams are reused from TAMIL_NADU_RESERVOIRS above and tagged here.
const TN_AS_INDIA_BODIES = TAMIL_NADU_RESERVOIRS.map((r) => ({ ...r, type: 'dam', state: 'Tamil Nadu' }))

const OTHER_INDIA_DAMS = [
  { id: 'bhakra', name: 'Bhakra Dam', type: 'dam', state: 'Himachal Pradesh', district: 'Bilaspur', lat: 31.42, lng: 76.43, fullCapacityKm2: 168.0, currentSurfaceAreaKm2: 121.0, dailyEvaporationML: 9.5, trend: -0.3 },
  { id: 'hirakud', name: 'Hirakud Dam', type: 'dam', state: 'Odisha', district: 'Sambalpur', lat: 21.53, lng: 83.85, fullCapacityKm2: 743.0, currentSurfaceAreaKm2: 520.0, dailyEvaporationML: 14.2, trend: -0.5 },
  { id: 'sardarsarovar', name: 'Sardar Sarovar Dam', type: 'dam', state: 'Gujarat', district: 'Narmada', lat: 21.83, lng: 73.75, fullCapacityKm2: 214.0, currentSurfaceAreaKm2: 168.0, dailyEvaporationML: 11.0, trend: -0.4 },
  { id: 'tehri', name: 'Tehri Dam', type: 'dam', state: 'Uttarakhand', district: 'Tehri Garhwal', lat: 30.38, lng: 78.48, fullCapacityKm2: 52.0, currentSurfaceAreaKm2: 44.6, dailyEvaporationML: 3.1, trend: -0.2 },
  { id: 'nagarjunasagar', name: 'Nagarjuna Sagar Dam', type: 'dam', state: 'Telangana', district: 'Nalgonda', lat: 16.57, lng: 79.31, fullCapacityKm2: 285.0, currentSurfaceAreaKm2: 180.0, dailyEvaporationML: 12.5, trend: -0.8 },
  { id: 'idukki', name: 'Idukki Dam', type: 'dam', state: 'Kerala', district: 'Idukki', lat: 9.84, lng: 76.97, fullCapacityKm2: 60.0, currentSurfaceAreaKm2: 52.0, dailyEvaporationML: 2.4, trend: -0.1 },
  { id: 'almatti', name: 'Almatti Dam', type: 'dam', state: 'Karnataka', district: 'Vijayapura', lat: 16.33, lng: 75.88, fullCapacityKm2: 65.0, currentSurfaceAreaKm2: 41.0, dailyEvaporationML: 5.6, trend: -0.9 },
  { id: 'ujjani', name: 'Ujjani Dam', type: 'dam', state: 'Maharashtra', district: 'Solapur', lat: 18.08, lng: 75.12, fullCapacityKm2: 112.0, currentSurfaceAreaKm2: 64.0, dailyEvaporationML: 7.8, trend: -1.2 },
  { id: 'ranapratapsagar', name: 'Rana Pratap Sagar Dam', type: 'dam', state: 'Rajasthan', district: 'Kota', lat: 25.13, lng: 75.65, fullCapacityKm2: 60.0, currentSurfaceAreaKm2: 36.0, dailyEvaporationML: 6.4, trend: -1.0 },
  { id: 'rihand', name: 'Rihand Dam', type: 'dam', state: 'Uttar Pradesh', district: 'Sonbhadra', lat: 24.05, lng: 83.02, fullCapacityKm2: 465.0, currentSurfaceAreaKm2: 310.0, dailyEvaporationML: 10.9, trend: -0.5 },
]

const INDIA_LAKES = [
  { id: 'dallake', name: 'Dal Lake', type: 'lake', state: 'Jammu & Kashmir', district: 'Srinagar', lat: 34.12, lng: 74.86, fullCapacityKm2: 18.0, currentSurfaceAreaKm2: 11.0, dailyEvaporationML: 1.1, trend: -1.6 },
  { id: 'chilika', name: 'Chilika Lake', type: 'lake', state: 'Odisha', district: 'Puri', lat: 19.7, lng: 85.32, fullCapacityKm2: 1100.0, currentSurfaceAreaKm2: 900.0, dailyEvaporationML: 22.0, trend: -0.3 },
  { id: 'wular', name: 'Wular Lake', type: 'lake', state: 'Jammu & Kashmir', district: 'Bandipora', lat: 34.36, lng: 74.6, fullCapacityKm2: 130.0, currentSurfaceAreaKm2: 86.0, dailyEvaporationML: 3.0, trend: -1.1 },
  { id: 'pulicat', name: 'Pulicat Lake', type: 'lake', state: 'Andhra Pradesh', district: 'Nellore', lat: 13.67, lng: 80.32, fullCapacityKm2: 461.0, currentSurfaceAreaKm2: 350.0, dailyEvaporationML: 9.4, trend: -0.6 },
  { id: 'loktak', name: 'Loktak Lake', type: 'lake', state: 'Manipur', district: 'Bishnupur', lat: 24.55, lng: 93.78, fullCapacityKm2: 287.0, currentSurfaceAreaKm2: 240.0, dailyEvaporationML: 5.0, trend: -0.2 },
  { id: 'vembanad', name: 'Vembanad Lake', type: 'lake', state: 'Kerala', district: 'Alappuzha', lat: 9.6, lng: 76.4, fullCapacityKm2: 2033.0, currentSurfaceAreaKm2: 1850.0, dailyEvaporationML: 18.0, trend: -0.1 },
]

const INDIA_PONDS_TANKS = [
  { id: 'veeranam', name: 'Veeranam Tank', type: 'pond', state: 'Tamil Nadu', district: 'Cuddalore', lat: 11.33, lng: 79.5, fullCapacityKm2: 8.5, currentSurfaceAreaKm2: 5.1, dailyEvaporationML: 1.4, trend: -1.3 },
  { id: 'hussainsagar', name: 'Hussain Sagar Lake', type: 'pond', state: 'Telangana', district: 'Hyderabad', lat: 17.42, lng: 78.47, fullCapacityKm2: 5.7, currentSurfaceAreaKm2: 4.2, dailyEvaporationML: 0.9, trend: -0.4 },
]

// Rivers use flow (cumecs) rather than surface area, since a river's
// health is about discharge, not extent.
const INDIA_RIVERS = [
  { id: 'ganga-varanasi', name: 'Ganga River — Varanasi', type: 'river', state: 'Uttar Pradesh', lat: 25.32, lng: 83.01, flowCumecs: 1450, flowStatus: 'Normal', trend: -0.4 },
  { id: 'yamuna-delhi', name: 'Yamuna River — Delhi', type: 'river', state: 'Delhi', lat: 28.6, lng: 77.25, flowCumecs: 65, flowStatus: 'Below Normal', trend: -1.8 },
  { id: 'godavari-rajahmundry', name: 'Godavari River — Rajahmundry', type: 'river', state: 'Andhra Pradesh', lat: 17.0, lng: 81.78, flowCumecs: 2100, flowStatus: 'Normal', trend: 0.2 },
  { id: 'krishna-vijayawada', name: 'Krishna River — Vijayawada', type: 'river', state: 'Andhra Pradesh', lat: 16.5, lng: 80.6, flowCumecs: 980, flowStatus: 'Normal', trend: -0.3 },
  { id: 'narmada-bharuch', name: 'Narmada River — Bharuch', type: 'river', state: 'Gujarat', lat: 21.7, lng: 72.97, flowCumecs: 1200, flowStatus: 'Normal', trend: 0.1 },
  { id: 'brahmaputra-guwahati', name: 'Brahmaputra River — Guwahati', type: 'river', state: 'Assam', lat: 26.18, lng: 91.75, flowCumecs: 8600, flowStatus: 'Normal', trend: 0.4 },
  { id: 'cauvery-trichy', name: 'Cauvery River — Trichy', type: 'river', state: 'Tamil Nadu', lat: 10.8, lng: 78.69, flowCumecs: 210, flowStatus: 'Below Normal', trend: -1.5 },
]

export const INDIA_WATER_BODIES = [
  ...TN_AS_INDIA_BODIES,
  ...OTHER_INDIA_DAMS,
  ...INDIA_LAKES,
  ...INDIA_PONDS_TANKS,
  ...INDIA_RIVERS,
]

export const WATER_BODY_TYPES = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'dam', label: 'Dams', icon: '🚧' },
  { id: 'lake', label: 'Lakes', icon: '🌊' },
  { id: 'pond', label: 'Ponds / Tanks', icon: '💧' },
  { id: 'river', label: 'Rivers', icon: '➰' },
]

// ---------- 16. Climate-Aware Next-Week Reserve Forecast ----------
export const CLIMATE_SEASONS = [
  { id: 'summer', label: 'Summer (Mar–May)', months: [2, 3, 4], evapMultiplier: 1.6, rainBoost: 0 },
  { id: 'monsoon', label: 'Monsoon (Jun–Sep)', months: [5, 6, 7, 8], evapMultiplier: 0.7, rainBoost: 1 },
  { id: 'post-monsoon', label: 'Post-Monsoon (Oct–Nov)', months: [9, 10], evapMultiplier: 0.9, rainBoost: 0.4 },
  { id: 'winter', label: 'Winter (Dec–Feb)', months: [11, 0, 1], evapMultiplier: 0.8, rainBoost: 0.1 },
]

export function getCurrentSeason(date = new Date()) {
  const m = date.getMonth()
  return CLIMATE_SEASONS.find((s) => s.months.includes(m)) ?? CLIMATE_SEASONS[0]
}

// Predicts a water body's reserve level ~1 week ahead, factoring the current
// climate season's evaporation rate and expected monsoon rainfall inflow.
// Production version: IMD 7-day rainfall forecast + CWC trend regression.
export function predictNextWeekReserve(waterBody, season = getCurrentSeason()) {
  if (waterBody.type === 'river') {
    const flowTrendPct = waterBody.trend * season.evapMultiplier - season.rainBoost * 2
    const projectedFlowCumecs = Math.max(0, Math.round(waterBody.flowCumecs * (1 + flowTrendPct / 100)))
    return { projectedFlowCumecs, pctChange: Math.round(flowTrendPct * 10) / 10, season: season.label }
  }
  const weeklyTrendPct = waterBody.trend * season.evapMultiplier - season.rainBoost * 1.5
  const projectedAreaKm2 = Math.max(0, +(waterBody.currentSurfaceAreaKm2 * (1 + weeklyTrendPct / 100)).toFixed(2))
  const projectedPctFull = Math.round((projectedAreaKm2 / waterBody.fullCapacityKm2) * 100)
  return { projectedAreaKm2, projectedPctFull, pctChange: Math.round(weeklyTrendPct * 10) / 10, season: season.label }
}

// National reserve outlook for the "next week" summary card — averages
// across all dams/lakes/ponds (rivers excluded since they're flow-based).
export function predictNationalReserveOutlook(waterBodies = INDIA_WATER_BODIES, season = getCurrentSeason()) {
  const storageBodies = waterBodies.filter((w) => w.type !== 'river')
  const totalCurrent = storageBodies.reduce((a, w) => a + w.currentSurfaceAreaKm2, 0)
  const totalFull = storageBodies.reduce((a, w) => a + w.fullCapacityKm2, 0)
  const totalProjected = storageBodies.reduce((a, w) => a + predictNextWeekReserve(w, season).projectedAreaKm2, 0)
  const pctChange = totalCurrent === 0 ? 0 : Math.round(((totalProjected - totalCurrent) / totalCurrent) * 1000) / 10
  return {
    currentPctFull: Math.round((totalCurrent / totalFull) * 100),
    projectedPctFull: Math.round((totalProjected / totalFull) * 100),
    pctChange,
    season: season.label,
    bodiesCounted: storageBodies.length,
  }
}

// ---------- 17. Dam Vault / Gate Status ----------
// Real dams open spillway gates once storage nears full capacity to
// prevent structural stress and downstream flooding risk.
export function getGateStatus(waterBody) {
  if (waterBody.type === 'river') {
    return { level: 'monitor', label: 'Flow monitoring point', className: 'ok', pct: null }
  }
  const pct = Math.round((waterBody.currentSurfaceAreaKm2 / waterBody.fullCapacityKm2) * 100)
  if (pct >= 95) return { level: 'open', label: '🔴 Gates OPEN — Flood release', className: 'danger', pct }
  if (pct >= 85) return { level: 'standby', label: '🟡 Gates on STANDBY', className: 'warn', pct }
  return { level: 'closed', label: '🟢 Gates CLOSED — Normal storage', className: 'ok', pct }
}

// ---------- 18. India State Water-Use Efficiency Ranking ----------
export const INDIA_STATE_EFFICIENCY = [
  { city: 'Kerala', efficiency: 86 },
  { city: 'Tamil Nadu', efficiency: 81 },
  { city: 'Karnataka', efficiency: 77 },
  { city: 'Gujarat', efficiency: 74 },
  { city: 'Maharashtra', efficiency: 70 },
  { city: 'Telangana', efficiency: 68 },
  { city: 'Uttar Pradesh', efficiency: 61 },
  { city: 'Rajasthan', efficiency: 58 },
  { city: 'Delhi', efficiency: 52 },
]
  .sort((a, b) => b.efficiency - a.efficiency)
  .map((d, i) => ({ ...d, rank: i + 1 }))

// ---------- 19. Rainwater Harvesting Mandate Impact Estimator ----------
// Approximate household counts and roof/rainfall averages by state — for
// modeling "what if RWH were made mandatory" at scale. Illustrative figures.
export const INDIA_STATE_HOUSEHOLDS = [
  { state: 'Tamil Nadu', households: 19500000, avgRoofAreaSqM: 90, annualRainfallMm: 950 },
  { state: 'Kerala', households: 8500000, avgRoofAreaSqM: 95, annualRainfallMm: 2900 },
  { state: 'Karnataka', households: 15600000, avgRoofAreaSqM: 85, annualRainfallMm: 1100 },
  { state: 'Maharashtra', households: 26300000, avgRoofAreaSqM: 80, annualRainfallMm: 1350 },
  { state: 'Gujarat', households: 13200000, avgRoofAreaSqM: 82, annualRainfallMm: 800 },
  { state: 'Delhi', households: 4100000, avgRoofAreaSqM: 70, annualRainfallMm: 790 },
  { state: 'Rajasthan', households: 14200000, avgRoofAreaSqM: 75, annualRainfallMm: 570 },
  { state: 'Uttar Pradesh', households: 35000000, avgRoofAreaSqM: 78, annualRainfallMm: 900 },
  { state: 'All India', households: 300000000, avgRoofAreaSqM: 80, annualRainfallMm: 1170 },
]

// Assumes an 80% collection efficiency (first-flush loss + filtration) —
// a standard planning assumption used in Indian RWH guidelines (CGWB / TN Act).
export function estimateRWHMandateImpact({ households, avgRoofAreaSqM, annualRainfallMm, adoptionPct = 100 }) {
  const perHouseholdLitersPerYear = Math.round(avgRoofAreaSqM * (annualRainfallMm / 1000) * 0.8 * 1000)
  const householdsCovered = Math.round(households * (adoptionPct / 100))
  const totalLitersPerYear = perHouseholdLitersPerYear * householdsCovered
  return {
    perHouseholdLitersPerYear,
    householdsCovered,
    totalLitersPerYear,
    totalMillionLitersPerYear: Math.round(totalLitersPerYear / 1e6),
  }
}

// ---------- 20. Drought Season Daily Survival Plan ----------
export const DROUGHT_DAILY_PLAN = [
  { day: 'Day 1', task: 'Switch to bucket bathing instead of showers', icon: '🪣', savings: 60 },
  { day: 'Day 2', task: 'Reuse laundry rinse water to flush toilets or mop floors', icon: '♻️', savings: 40 },
  { day: 'Day 3', task: 'Stop all car washing, garden watering, and terrace cleaning', icon: '🚫', savings: 100 },
  { day: 'Day 4', task: 'Fix every dripping tap and check pipe joints for leaks', icon: '🔧', savings: 15 },
  { day: 'Day 5', task: 'Cook using minimal-water methods (steaming / pressure cooking)', icon: '🍲', savings: 10 },
  { day: 'Day 6', task: 'Collect and store any available rainwater or greywater', icon: '🌧️', savings: 25 },
  { day: 'Day 7', task: 'Community check-in — share tanker / borewell water fairly', icon: '🤝', savings: 0 },
]

// ---------- 21. Hourly Live Data Refresh ----------
// Nudges the most recent smart-meter reading, simulating a live feed that
// updates once every hour. In production this would be an IoT/utility push.
export function generateHourlyTick(history) {
  const updated = [...history]
  const last = updated[updated.length - 1]
  const noise = Math.random() * 10 - 5
  const newValue = Math.max(60, Math.round(last.liters + noise))
  updated[updated.length - 1] = { ...last, liters: newValue }
  return updated
}
