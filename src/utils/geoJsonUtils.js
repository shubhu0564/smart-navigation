const DEFAULT_CENTER = { lat: 19.105, lng: 72.824 }

const LANDMARK_CATEGORY_IDS = {
  Park: 'park',
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
  education: 'Educational Institute',
  busStop: 'Bus Stop',
  government: 'Government Building',
}

export function getLandmarkCategoryId(category) {
  const normalized = String(category ?? '').trim()
  return LANDMARK_CATEGORY_IDS[normalized] ?? 'landmark'
}

export function getLandmarkCategoryLabel(categoryId) {
  return LANDMARK_CATEGORY_LABELS[categoryId] ?? 'Landmark'
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
  const [lng, lat] = feature.geometry.coordinates || [referencePoint.lng, referencePoint.lat]
  const categoryId = getLandmarkCategoryId(properties.category)

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
    const category = getLandmarkCategoryId(feature?.properties?.category)
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
