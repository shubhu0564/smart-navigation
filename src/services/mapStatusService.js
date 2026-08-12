const DEFAULT_COORDINATES = {
  latitude: 19.105,
  longitude: 72.824,
}

const WEATHER_BASE_URL = import.meta.env.VITE_GULMOHAR_WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_BASE_URL = import.meta.env.VITE_GULMOHAR_AQI_API_URL || 'https://air-quality-api.open-meteo.com/v1/air-quality'

const WEATHER_CODE_LABELS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  80: 'Rain showers',
  81: 'Heavy showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function fetchGulmoharAreaStatus(coordinates = DEFAULT_COORDINATES) {
  const latitude = coordinates.latitude ?? DEFAULT_COORDINATES.latitude
  const longitude = coordinates.longitude ?? DEFAULT_COORDINATES.longitude

  const weatherUrl = new URL(WEATHER_BASE_URL)
  weatherUrl.searchParams.set('latitude', String(latitude))
  weatherUrl.searchParams.set('longitude', String(longitude))
  weatherUrl.searchParams.set('current', 'temperature_2m,weather_code')
  weatherUrl.searchParams.set('timezone', 'auto')

  const airQualityUrl = new URL(AIR_QUALITY_BASE_URL)
  airQualityUrl.searchParams.set('latitude', String(latitude))
  airQualityUrl.searchParams.set('longitude', String(longitude))
  airQualityUrl.searchParams.set('current', 'us_aqi,pm2_5,pm10')
  airQualityUrl.searchParams.set('timezone', 'auto')

  const [weatherResult, airQualityResult] = await Promise.allSettled([
    fetchJson(weatherUrl.toString()),
    fetchJson(airQualityUrl.toString()),
  ])

  const status = {
    aqi: 'Data unavailable',
    weatherCondition: 'Data unavailable',
    temperature: 'Data unavailable',
    updatedAt: new Date(),
  }

  if (weatherResult.status === 'fulfilled') {
    const current = weatherResult.value?.current ?? {}
    if (typeof current.temperature_2m === 'number') {
      status.temperature = `${Math.round(current.temperature_2m)}°C`
    }
    if (typeof current.weather_code === 'number') {
      status.weatherCondition = WEATHER_CODE_LABELS[current.weather_code] ?? 'Data unavailable'
    }
  }

  if (airQualityResult.status === 'fulfilled') {
    const current = airQualityResult.value?.current ?? {}
    if (typeof current.us_aqi === 'number') {
      status.aqi = String(Math.round(current.us_aqi))
    }
  }

  return status
}