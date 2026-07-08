// Open-Meteo is a free, public weather API — no API key or signup required.
// Docs: https://open-meteo.com/en/docs
// Used to auto-override irrigation/supply scheduling when rain or heatwaves are forecast.

export async function fetchForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=precipitation_probability_max,precipitation_sum,temperature_2m_max&timezone=auto&forecast_days=5`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`)
  const data = await res.json()

  return data.daily.time.map((date, i) => ({
    date,
    rainChancePct: data.daily.precipitation_probability_max[i],
    rainMm: data.daily.precipitation_sum[i],
    maxTempC: data.daily.temperature_2m_max[i],
  }))
}

// Decides whether irrigation/supply scheduling should be overridden today,
// based on tomorrow's rain chance or an ongoing heatwave.
export function evaluateIrrigationOverride(forecast) {
  if (!forecast || forecast.length === 0) {
    return { override: false, reason: 'No forecast data available.', action: 'none' }
  }

  const today = forecast[0]
  const tomorrow = forecast[1] || today
  const HEATWAVE_TEMP_C = 40
  const RAIN_SKIP_THRESHOLD_PCT = 60

  if (tomorrow.rainChancePct >= RAIN_SKIP_THRESHOLD_PCT) {
    return {
      override: true,
      reason: `${tomorrow.rainChancePct}% chance of rain (${tomorrow.rainMm}mm) forecast for tomorrow.`,
      action: 'irrigation_paused',
    }
  }

  const heatwaveDays = forecast.filter((d) => d.maxTempC >= HEATWAVE_TEMP_C).length
  if (heatwaveDays >= 2) {
    return {
      override: true,
      reason: `Heatwave detected: ${heatwaveDays} of the next ${forecast.length} days forecast above ${HEATWAVE_TEMP_C}°C.`,
      action: 'supply_increased',
    }
  }

  return {
    override: false,
    reason: 'No rain or heatwave conditions significant enough to override the schedule.',
    action: 'none',
  }
}
