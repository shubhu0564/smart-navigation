import { useEffect, useState } from 'react'

const GEOJSON_FILES = {
  siteBoundary: 'site_boundary.geojson',
  buildings: 'buildings.geojson',
  clientBuildings: 'client_buildings.geojson',
  busStops: 'bus_stops.geojson',
  parkPlayground: 'park_playground.geojson',
  roads: 'roads.geojson',
  openSpaces: 'open_spaces.geojson',
  riverNallah: 'river_nallah.geojson',
  
}

async function fetchGeoJson(fileName) {
  const basePath = import.meta.env.BASE_URL || '/'
  const fetchUrl = `${basePath}data/${fileName}`

  try {
    const response = await fetch(fetchUrl)

    if (!response.ok) {
      console.error(
        `[useGeoJsonData] Failed to load ${fetchUrl}: HTTP ${response.status}`
      )
      return null
    }

    const contentType = response.headers.get('content-type') || ''

    // Accept typical JSON/GeoJSON content types
    const isJson = /json|geo\+json|application\/octet-stream/i.test(contentType)

    if (!isJson) {
      // Do not attempt to parse non-JSON (HTML error pages etc.)
      const text = await response.text()
      const snippet = text.slice(0, 240).replace(/\s+/g, ' ')
      console.error(
        `[useGeoJsonData] Invalid Content-Type for ${fetchUrl}: ${contentType} — response start: ${snippet}`
      )
      return null
    }

    let json
    try {
      json = await response.json()
    } catch (parseErr) {
      console.error(
        `[useGeoJsonData] Failed to parse JSON from ${fetchUrl}: ${parseErr.message}`
      )
      return null
    }

    if (
      !json ||
      json.type !== 'FeatureCollection' ||
      !Array.isArray(json.features)
    ) {
      console.error(
        `[useGeoJsonData] ${fileName} is not a valid GeoJSON FeatureCollection`
      )
      return null
    }

    if (fileName === 'buildings.geojson') {
      console.log(`Loaded ${json.features.length} building features`)
    }

    return json
  } catch (error) {
    console.error(`[useGeoJsonData] ${error?.message || error}`)
    return null
  }
}

export function useGeoJsonData() {
  const [geoJson, setGeoJson] = useState({
    siteBoundary: null,
    roads: null,
    buildings: null,
    openSpaces: null,
    parkPlayground: null,
    landmarks: null,
    clientBuildings: null,
    busStops: null,
    riverNallah: null,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadFiles() {
      setLoading(true)

      const results = await Promise.all(
        Object.entries(GEOJSON_FILES).map(
          async ([key, fileName]) => {
            const data = await fetchGeoJson(fileName)
            return [key, data]
          }
        )
      )

      if (!isMounted) return

      const nextGeoJson = Object.fromEntries(results)

      setGeoJson(nextGeoJson)

      const failedFiles = Object.entries(nextGeoJson)
        .filter(([, value]) => value === null)
        .map(([key]) => key)

      if (failedFiles.length > 0) {
        setError(
          `Could not load: ${failedFiles.join(', ')}`
        )
      } else {
        setError(null)
      }

      setLoading(false)
    }

    loadFiles()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    geoJson,
    loading,
    error,
  }
}