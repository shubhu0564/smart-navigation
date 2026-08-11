import { useEffect, useState } from 'react'

const GEOJSON_FILES = {
  siteBoundary: 'site_boundary.geojson',
  roads: 'roads.geojson',
  buildings: 'buildings.geojson',
  openSpaces: 'open_spaces.geojson',
  landmarks: 'landmarks.geojson',
}

async function fetchGeoJson(fileName) {
  const basePath = import.meta.env.BASE_URL || '/'
  const fetchUrl = `${basePath}data/${fileName}`

  try {
    const response = await fetch(fetchUrl)

    if (!response.ok) {
      throw new Error(
        `Failed to load ${fetchUrl}: ${response.status}`
      )
    }

    const json = await response.json()

    if (
      !json ||
      json.type !== 'FeatureCollection' ||
      !Array.isArray(json.features)
    ) {
      throw new Error(
        `${fileName} is not a valid GeoJSON FeatureCollection`
      )
    }

    if (fileName === 'buildings.geojson') {
      console.log(
        `Loaded ${json.features.length} building features`
      )
    }

    return json
  } catch (error) {
    console.error(`[useGeoJsonData] ${error.message}`)
    return null
  }
}

export function useGeoJsonData() {
  const [geoJson, setGeoJson] = useState({
    siteBoundary: null,
    roads: null,
    buildings: null,
    openSpaces: null,
    landmarks: null,
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