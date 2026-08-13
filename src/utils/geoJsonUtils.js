const DEFAULT_CENTER = { lat: 19.105, lng: 72.824 }

const LANDMARK_CATEGORY_IDS = {
  Park: 'park',
  Parkland: 'park',
  Playground: 'park',
  Park_Playground: 'park',
  'Park / Playground': 'park',
  Community: 'community',
  CommunityCenter: 'community',
  School: 'education',
  Institute: 'education',
  'Research Institute': 'education',
  'Bus Stop': 'busStop',
  Government: 'government',
}

const LANDMARK_CATEGORY_LABELS = {
  all: 'Landmark',
  landmark: 'Landmark',
  park: 'Park / Playground',
  community: 'Community Center',
  education: 'Educational Institute',
  busStop: 'Bus Stop',
  government: 'Government Building',
  uncategorized: 'Uncategorized',
}

export function getLandmarkCategoryId(category) {
  const normalized = String(category ?? '').trim()
  const allowedIds = new Set([...
    Object.values(LANDMARK_CATEGORY_IDS),
    'landmark',
    'all',
    'uncategorized',
  ])

  // If the caller passed an internal id already, return it unchanged
  if (allowedIds.has(normalized)) return normalized

  // Match known source strings to internal ids
  if (LANDMARK_CATEGORY_IDS[normalized]) return LANDMARK_CATEGORY_IDS[normalized]

  // Default to uncategorized when nothing matches
  return 'uncategorized'
}

export function getLandmarkCategoryLabel(categoryId) {
  return LANDMARK_CATEGORY_LABELS[categoryId] ?? 'Uncategorized'
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function haversineDistanceKm(a, b) {
  const R = 6371
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const square = sinLat * sinLat + sinLng * sinLng * Math.cos(lat1) * Math.cos(lat2)
  return R * 2 * Math.atan2(Math.sqrt(square), Math.sqrt(1 - square))
}

export function normalizeLandmarkFeature(feature, referencePoint = DEFAULT_CENTER) {
  if (!feature || feature.type !== 'Feature' || !feature.geometry) return null
  const { properties = {} } = feature
  // Extract the first numeric coordinate pair from the geometry safely.
  const extractFirstPair = (coords) => {
    if (!coords) return null
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') return coords
    for (const c of coords) {
      const found = extractFirstPair(c)
      if (found) return found
    }
    return null
  }

  const first = extractFirstPair(feature.geometry.coordinates) || [referencePoint.lng, referencePoint.lat]
  const [lng, lat] = first
  // Prefer a derivedCategory (created from client buildings) if present
  const categoryId = getLandmarkCategoryId(properties.derivedCategory ?? properties.category)

  const distanceKm = haversineDistanceKm({ lat, lng }, referencePoint)
  const walkDistanceKm = Math.max(0.3, Number((distanceKm * 1.3).toFixed(1)))
  const walkTimeMin = Math.max(4, Math.round((walkDistanceKm / 5) * 60))

  return {
    id: properties.id ?? `${lat}-${lng}`,
    number: String(properties.id ?? '').padStart(2, '0'),
    name: properties.name ?? 'Unknown place',
    road: properties.road ?? properties.address ?? '',
    category: categoryId,
    categoryLabel: getLandmarkCategoryLabel(categoryId),
    // preserve original source feature (polygon) when available so UI can use authoritative geometry
    feature: properties.sourceFeature ?? feature,
    sourceCategory: properties.category ?? 'Unknown',
    latitude: lat,
    longitude: lng,
    lat,
    lng,
    description: properties.description ?? properties.name ?? '',
    image: properties.image ?? null,
    icon: properties.icon ?? 'MapPin',
    distanceKm,
    walkDistanceKm,
    walkTimeMin,
    address: properties.address ?? properties.road ?? '',
    rating: properties.rating ?? 4.6,
    tags: properties.tags ?? [properties.category ?? 'Point of interest'],
    steps:
      properties.steps ?? [
        { en: 'Head toward the destination as shown on the map.', mr: 'नकाशावर दाखवल्याप्रमाणे गंतव्याकडे चला.' },
        { en: 'Follow the nearest accessible path to reach the location.', mr: 'स्थानावर पोहोचण्यासाठी जवळच्या प्रवेशयोग्य मार्गाचे अनुसरण करा.' },
      ],
  }
}

export function normalizeLandmarks(geoJson, referencePoint = DEFAULT_CENTER) {
  if (!geoJson || !Array.isArray(geoJson.features)) return []
  return geoJson.features
    .map((feature) => normalizeLandmarkFeature(feature, referencePoint))
    .filter(Boolean)
}

export function filterLandmarksGeoJson(geoJson, selectedCategory, searchQuery, enabledCategories) {
  if (!geoJson || !Array.isArray(geoJson.features)) return null
  const query = String(searchQuery || '').trim().toLowerCase()
  const features = geoJson.features.filter((feature) => {
    const category = getLandmarkCategoryId(feature?.properties?.derivedCategory || feature?.properties?.category)
    const name = feature?.properties?.name ?? ''
    const road = feature?.properties?.road ?? ''

    const categoryMatch = selectedCategory === 'all' || category === selectedCategory
    const enabledMatch = enabledCategories.length === 0 || enabledCategories.includes(category) || category === 'landmark'
    const searchMatch =
      !query || [name, road, category, String(feature?.properties?.id ?? '')].some((value) => value.toLowerCase().includes(query))

    return categoryMatch && enabledMatch && searchMatch
  })

  return { ...geoJson, features }
}

// =====================
// Site membership utils
// =====================

function pointInRing(point, ring) {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function pointInPolygon(point, polygon) {
  if (!polygon || polygon.length === 0) return false
  if (!pointInRing(point, polygon[0])) return false
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false
  }
  return true
}

function pointInMultiPolygon(point, multi) {
  for (const poly of multi) {
    if (pointInPolygon(point, poly)) return true
  }
  return false
}

function centroidOfPolygon(polygon) {
  // Ensure polygon is an array of linear rings and pick the exterior ring.
  let ring = null
  if (Array.isArray(polygon) && polygon.length > 0) {
    if (Array.isArray(polygon[0]) && polygon[0].length > 0 && typeof polygon[0][0] === 'number') {
      // polygon is actually a single ring (edge case)
      ring = polygon
    } else if (Array.isArray(polygon[0]) && Array.isArray(polygon[0][0])) {
      ring = polygon[0]
    }
  }

  // Fallback: find first numeric coordinate pair anywhere
  if (!ring || ring.length === 0) {
    const findFirst = (coords) => {
      if (!Array.isArray(coords)) return null
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') return coords
      for (const c of coords) {
        const r = findFirst(c)
        if (r) return r
      }
      return null
    }
    const pair = findFirst(polygon)
    if (pair) return pair
    return [0, 0]
  }

  let area = 0, cx = 0, cy = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0] ?? 0, yi = ring[i][1] ?? 0
    const xj = ring[j][0] ?? 0, yj = ring[j][1] ?? 0
    const a = xj * yi - xi * yj
    area += a
    cx += (xj + xi) * a
    cy += (yj + yi) * a
  }
  area *= 0.5
  if (area === 0) return [ring[0][0] ?? 0, ring[0][1] ?? 0]
  cx /= (6 * area)
  cy /= (6 * area)
  return [cx, cy]
}

export function isFeatureInsideSite(feature, siteGeoJson) {
  if (!feature || !feature.geometry || !siteGeoJson || !Array.isArray(siteGeoJson.features) || siteGeoJson.features.length === 0) return false
  const siteCoords = siteGeoJson.features[0].geometry.coordinates
  const geom = feature.geometry
  let point = null
  if (geom.type === 'Point') point = [geom.coordinates[0], geom.coordinates[1]]
  else if (geom.type === 'MultiPoint') point = [geom.coordinates[0][0], geom.coordinates[0][1]]
  else if (geom.type === 'Polygon') point = centroidOfPolygon(geom.coordinates)
  else if (geom.type === 'MultiPolygon') point = centroidOfPolygon(geom.coordinates[0])
  else if (geom.type === 'LineString') point = geom.coordinates[Math.floor(geom.coordinates.length / 2)]
  else {
    // find first numeric pair
    const findFirst = (coords) => {
      if (!Array.isArray(coords)) return null
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') return coords
      for (const c of coords) {
        const r = findFirst(c)
        if (r) return r
      }
      return null
    }
    const first = findFirst(geom.coordinates)
    if (first) point = [first[0], first[1]]
  }

  if (!point) return false
  return pointInMultiPolygon(point, siteCoords)
}

export function filterGeoJsonBySite(geoJson, siteGeoJson) {
  if (!geoJson || !Array.isArray(geoJson.features)) return null
  if (!siteGeoJson || !Array.isArray(siteGeoJson.features) || siteGeoJson.features.length === 0) return geoJson
  const features = geoJson.features.filter((f) => isFeatureInsideSite(f, siteGeoJson))
  return { ...geoJson, features }
}

// Derive category for a feature coming from client_buildings or other datasets.
export function deriveFeatureCategory(feature, source = 'clientBuildings') {
  if (!feature || !feature.properties) return 'landmark'
  const props = feature.properties || {}

  // If source is busStops or parkPlayground, return fixed categories
  if (source === 'busStops') return 'busStop'
  if (source === 'parkPlayground' || source === 'openSpaces') return 'park'

  // Check explicit Landmarks property first
  const landmarks = String(props.Landmarks ?? props.landmarks ?? props.category ?? '').trim()
  if (landmarks) {
    const key = landmarks.toLowerCase()
    if (key.includes('school') || key.includes('vidya') || key.includes('institute') || key.includes('college') || key.includes('vidyanidhi')) return 'education'
    if (key.includes('bus')) return 'busStop'
    if (key.includes('park') || key.includes('play')) return 'park'
    if (key.includes('government') || key.includes('gov') || key.includes('cdac')) return 'government'
    if (key.includes('community') || key.includes('bhavan') || key.includes('community center')) return 'community'
  }

  // Fallback: inspect building name for hints
  const name = String(props.bldg_namee ?? props.bldg_name ?? props.name ?? '').toLowerCase()
  if (name) {
    if (name.includes('school') || name.includes('vidya') || name.includes('institute') || name.includes('college')) return 'education'
    if (name.includes('park') || name.includes('playground') || name.includes('play')) return 'park'
    if (name.includes('bus stop') || name.includes('bus')) return 'busStop'
    if (name.includes('government') || name.includes('cdac')) return 'government'
    if (name.includes('community') || name.includes('bhavan')) return 'community'
  }

  return 'uncategorized'
}

// Create a derived landmarks FeatureCollection from client buildings.
// Each derived landmark is a Point placed at the building's centroid but keeps the
// original building feature as `sourceFeature` in properties so clicks can use
// the true geometry (polygon) as the source of truth.
export function extractLandmarksFromClientBuildings(clientBuildingsGeoJson) {
  if (!clientBuildingsGeoJson || !Array.isArray(clientBuildingsGeoJson.features)) return { type: 'FeatureCollection', features: [] }

  const features = []

  for (const f of clientBuildingsGeoJson.features) {
    try {
      const category = deriveFeatureCategory(f, 'clientBuildings')
      const centroid = f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') ? centroidOfPolygon(f.geometry.coordinates) : null
      if (!centroid || !Array.isArray(centroid) || centroid.length < 2) continue
      const [lng, lat] = centroid
      const props = Object.assign({}, f.properties || {})
      props.source = 'clientBuildings'
      props.derivedCategory = category
      // Keep a reference to the original feature for click/routing
      props.sourceFeature = f

      features.push({
        type: 'Feature',
        properties: props,
        geometry: { type: 'Point', coordinates: [lng, lat] },
      })
    } catch (e) {
      // skip invalid feature
    }
  }

  return { type: 'FeatureCollection', features }
}
