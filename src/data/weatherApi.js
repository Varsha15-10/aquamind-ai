// Open-Meteo is a free, public weather API — no API key or signup required.
// Docs: https://open-meteo.com/en/docs

const DEFAULT_LOCATION = { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' }

export function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(DEFAULT_LOCATION)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Your location' }),
      () => resolve(DEFAULT_LOCATION),
      { timeout: 4000 }
    )
  })
}

export async function fetchRainForecast(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=3`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`)
  const data = await res.json()
  return data.daily.time.map((date, i) => ({
    date,
    rainChancePct: data.daily.precipitation_probability_max[i],
    rainMm: data.daily.precipitation_sum[i],
  }))
}
