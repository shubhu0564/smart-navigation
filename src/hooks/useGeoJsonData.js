import { useEffect, useState } from 'react'
import proj4 from 'proj4'

const GEOJSON_FILES = {
  siteBoundary: 'site_boundary.geojson',
  roads: 'roads.geojson',
  buildings: 'buildings.geojson',
  openSpaces: 'open_spaces.geojson',
  landmarks: 'landmarks.geojson',
}

const getGeoJsonCrsCode = (geoJson) => {
  const name = geoJson?.crs?.properties?.name || geoJson?.crs?.properties?.href
  if (!name || typeof name !== 'string') return null
  const match = name.match(/EPSG:(\d+)/i) || name.match(/EPSG::(\d+)/i)
  return match ? `EPSG:${match[1]}` : name
}

const isLonLat = (coord) => {
  if (!Array.isArray(coord) || coord.length < 2) return false
  const [x, y] = coord
  return typeof x === 'number' && typeof y === 'number' && x >= -180 && x <= 180 && y >= -90 && y <= 90
}

const collectLeafCoordinates = (coords, collector = []) => {
  if (!Array.isArray(coords)) return collector
  if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    collector.push(coords)
    return collector
  }
  coords.forEach((child) => collectLeafCoordinates(child, collector))
  return collector
}

const transformCoordinates = (coords, transformFn) => {
  if (!Array.isArray(coords)) return coords
  if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    return transformFn(coords)
  }
  return coords.map((child) => transformCoordinates(child, transformFn))
}

const ensureGeoJsonWgs84 = (geoJson) => {
  if (!geoJson || geoJson.type !== 'FeatureCollection' || !Array.isArray(geoJson.features)) return geoJson

  const sourceCrs = getGeoJsonCrsCode(geoJson)
  const origin = sourceCrs && sourceCrs !== 'EPSG:4326' ? sourceCrs : null
  const allCoords = geoJson.features.flatMap((feature) => collectLeafCoordinates(feature?.geometry?.coordinates))
  const isAlreadyWgs84 = allCoords.every((coord) => isLonLat(coord))

  if (isAlreadyWgs84) return geoJson

  const fromProj = origin || 'EPSG:3857'
  const transformFn = (coord) => {
    if (!Array.isArray(coord) || coord.length < 2) return coord
    try {
      const [x, y] = proj4(fromProj, 'WGS84', coord)
      return [x, y]
    } catch (error) {
      console.warn('[useGeoJsonData] projection transform failed for coordinate', coord, error)
      return coord
    }
  }

  return {
    ...geoJson,
    features: geoJson.features.map((feature) => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: transformCoordinates(feature.geometry.coordinates, transformFn),
      },
    })),
  }
}

async function fetchGeoJson(fileName) {
  try {
    const response = await fetch(`/data/${fileName}`)
    if (!response.ok) {
      throw new Error(`Unable to load ${fileName} (status ${response.status})`)
    }
    const json = await response.json()
    return ensureGeoJsonWgs84(json)
  } catch (error) {
    console.error('[useGeoJsonData] failed to load', fileName, error)
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
        Object.entries(GEOJSON_FILES).map(async ([key, fileName]) => {
          const data = await fetchGeoJson(fileName)
          return [key, data]
        }),
      )

      if (!isMounted) return

      const nextGeoJson = Object.fromEntries(results)
      setGeoJson(nextGeoJson)

      const failedFiles = Object.entries(nextGeoJson)
        .filter(([, value]) => value === null)
        .map(([key]) => key)

      if (failedFiles.length > 0) {
        setError(`Could not load: ${failedFiles.join(', ')}`)
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

  return { geoJson, loading, error }
}
