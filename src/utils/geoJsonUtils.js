export const CORPORATION_LANDMARKS = [
  {
    id: 1,
    name: 'Kishore Kumar Bagh',
  },
  {
    id: 2,
    name: 'Vijay Tendulkar Amphitheatre',
  },
  {
    id: 3,
    name: 'Kaifi Azmi Park',
  },
  {
    id: 4,
    name: 'Kamla Raheja Vidyanidhi institute for architecture and environmental studies',
  },
  {
    id: 5,
    name: 'Vrajlal Parekh Vidyanidhi High School',
  },
  {
    id: 6,
    name: 'Manoj Kumar Garden',
  },
  {
    id: 7,
    name: 'Smt SB Aarya Vidya Mandir',
  },
  {
    id: 8,
    name: 'Lokmanya Tilak Udyan',
  },
  {
    id: 9,
    name: 'Ecole Mondiale World School',
  },
  {
    id: 10,
    name: 'Gujarath Bhavan',
  },
  {
    id: 11,
    name: 'Goa Bhavan',
  },
  {
    id: 12,
    name: 'CDAC – Centre For Development of Advance Computing',
  },
  {
    id: 13,
    name: 'Ivy League House (Girls Hostel)',
  },
  {
    id: 14,
    name: 'Juhu Club Millennium',
  },
  {
    id: 15,
    name: 'Shree Kalimata Temple',
  },
  {
    id: 16,
    name: 'Manoranjan Park',
  },
]

const normalize = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export const findCorporationLandmark = (value) => {
  const target = normalize(value)

  if (!target) {
    return null
  }

  const aliases = {
    'kishore kumar bagh': 1,

    'vijay tendulkar amphitheatre': 2,
    'vijay tendulkar amphitheater': 2,

    'kaifi azmi park': 3,

    'kamla raheja vidyanidhi institute for architecture environmental studies': 4,
    'kamla raheja vidyanidhi': 4,
    'krvia': 4,

    'vrajlal parekh vidyanidhi high school': 5,
    'vrajlal parekh': 5,

    'manoj kumar garden': 6,

    'smt sb aarya vidya mandir': 7,
    'sb aarya vidya mandir': 7,
    'aarya vidya mandir': 7,

    'lokmanya tilak udyan': 8,
    'tilak udyan': 8,

    'ecole mondiale world school': 9,
    'ecole mondiale': 9,

    'gujarath bhavan': 10,
    'gujarat bhavan': 10,

    'goa bhavan': 11,

    'cdac': 12,
    'centre for development of advance computing': 12,
    'centre for development of advanced computing': 12,

    'ivy league house': 13,
    'ivy league house girls hostel': 13,

    'juhu club millennium': 14,
    'juhu club': 14,

    'shree kalimata temple': 15,
    'kalimata temple': 15,

    'manoranjan park': 16,
  }

  const exactId = aliases[target]

  if (exactId) {
    return CORPORATION_LANDMARKS.find(
      (item) => item.id === exactId,
    )
  }

  const found = CORPORATION_LANDMARKS.find(
    (item) => {
      const name = normalize(item.name)

      return (
        target.includes(name) ||
        name.includes(target)
      )
    },
  )

  return found ?? null
}


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

  // The latest client GIS is the source of truth for landmark geometry.
  // A feature is a GIS landmark only when Landmarks is yes/true/1.
  const isGISLandmark = ['yes', 'true', '1'].includes(
    String(properties.Landmarks ?? properties.landmarks ?? '')
      .trim()
      .toLowerCase(),
  )

  if (!isGISLandmark) return null

  const extractFirstPair = (coords) => {
    if (!Array.isArray(coords)) return null
    if (
      typeof coords[0] === 'number' &&
      typeof coords[1] === 'number'
    ) {
      return coords
    }

    for (const c of coords) {
      const found = extractFirstPair(c)
      if (found) return found
    }

    return null
  }

  const first =
    extractFirstPair(feature.geometry.coordinates) ||
    [referencePoint.lng, referencePoint.lat]

  const [lng, lat] = first

  const categoryId = 'landmark'

  const distanceKm = haversineDistanceKm(
    { lat, lng },
    referencePoint,
  )

  const walkDistanceKm = Math.max(
    0.3,
    Number((distanceKm * 1.3).toFixed(1)),
  )

  const walkTimeMin = Math.max(
    4,
    Math.round((walkDistanceKm / 5) * 60),
  )

  const gisName =
    properties.bldg_namee ??
    properties.bldg_name ??
    properties.building_name ??
    properties.landmarkName ??
    properties.name ??
    properties.Name ??
    'Unknown place'

  const gisNumber =
    properties.bldg_no ??
    properties.building_no ??
    properties.landmarkNo ??
    properties.landmark_no ??
    ''

  return {
    // Stable ID comes from the GIS feature when available.
    id:
      properties.fid_1 ??
      properties.id ??
      `gis-landmark-${lat}-${lng}`,

    // Do not invent a landmark number from the old 1–16 list.
    number: gisNumber === '' ? '' : String(gisNumber),

    // Name comes directly from the new client GIS.
    name: String(gisName).trim(),

    road:
      properties.road ??
      properties.address ??
      '',

    category: categoryId,
    categoryLabel: getLandmarkCategoryLabel(categoryId),

    // MOST IMPORTANT:
    // Preserve the exact original polygon/multipolygon.
    feature,

    sourceCategory: 'clientBuildings',
    isGISLandmark: true,

    latitude: lat,
    longitude: lng,
    lat,
    lng,

    description:
      properties.description ??
      String(gisName).trim(),

    image: properties.image ?? null,
    icon: properties.icon ?? 'MapPin',

    distanceKm,
    walkDistanceKm,
    walkTimeMin,

    address:
      properties.address ??
      properties.road ??
      '',

    rating: properties.rating ?? 4.6,

    tags:
      properties.tags ??
      ['Landmark'],

    steps:
      properties.steps ?? [
        {
          en: 'Head toward the destination as shown on the map.',
          mr: 'नकाशावर दाखवल्याप्रमाणे गंतव्याकडे चला.',
        },
        {
          en: 'Follow the nearest accessible path to reach the location.',
          mr: 'स्थानावर पोहोचण्यासाठी जवळच्या प्रवेशयोग्य मार्गाचे अनुसरण करा.',
        },
      ],
  }
}

export function normalizeLandmarks(
  geoJson,
  referencePoint = DEFAULT_CENTER,
) {
  if (!geoJson || !Array.isArray(geoJson.features)) {
    return []
  }

  return geoJson.features
    .filter((feature) => {
      const value =
        feature?.properties?.Landmarks ??
        feature?.properties?.landmarks ??
        ''

      return ['yes', 'true', '1'].includes(
        String(value).trim().toLowerCase(),
      )
    })
    .map((feature) =>
      normalizeLandmarkFeature(
        feature,
        referencePoint,
      ),
    )
    .filter(Boolean)
}

export function filterLandmarksGeoJson(
  geoJson,
  selectedCategory,
  searchQuery,
  enabledCategories = [],
) {
  if (!geoJson || !Array.isArray(geoJson.features)) {
    return null
  }

  const query = String(searchQuery || '')
    .trim()
    .toLowerCase()

  const features = geoJson.features.filter((feature) => {
    const props = feature?.properties ?? {}

    // For client buildings, only features explicitly marked as
    // Landmarks=yes/true/1 are allowed into the landmark layer.
    const isGISLandmark = ['yes', 'true', '1'].includes(
      String(
        props.Landmarks ??
        props.landmarks ??
        '',
      )
        .trim()
        .toLowerCase(),
    )

    if (!isGISLandmark) return false

    const category = 'landmark'

    const name =
      props.bldg_namee ??
      props.bldg_name ??
      props.building_name ??
      props.landmarkName ??
      props.name ??
      props.Name ??
      ''

    const road =
      props.road ??
      props.address ??
      ''

    const searchValues = [
      name,
      road,
      category,
      props.bldg_no,
      props.landmarkNo,
      props.id,
      props.fid_1,
    ]

    const categoryMatch =
      selectedCategory === 'all' ||
      selectedCategory === 'landmark' ||
      selectedCategory === 'landmarks' ||
      category === selectedCategory

    const enabledMatch =
      enabledCategories.length === 0 ||
      enabledCategories.includes('landmark')

    const searchMatch =
      !query ||
      searchValues.some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(query),
      )

    return (
      categoryMatch &&
      enabledMatch &&
      searchMatch
    )
  })

  return {
    ...geoJson,
    features,
  }
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

  // The latest client GIS explicitly marks landmark features with
  // Landmarks = yes/true/1. This is the authoritative landmark flag.
  const landmarks = String(props.Landmarks ?? props.landmarks ?? '').trim()
  if (['yes', 'true', '1'].includes(landmarks.toLowerCase())) {
    return 'landmark'
  }

  // Keep support for older datasets that stored a descriptive category.
  const explicitCategory = String(props.category ?? '').trim()
  if (explicitCategory) {
    const key = explicitCategory.toLowerCase()
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
export function extractLandmarksFromClientBuildings(
  clientBuildingsGeoJson,
) {
  if (
    !clientBuildingsGeoJson ||
    !Array.isArray(clientBuildingsGeoJson.features)
  ) {
    return {
      type: 'FeatureCollection',
      features: [],
    }
  }

  const features = []

  for (const sourceFeature of clientBuildingsGeoJson.features) {
    try {
      const props = sourceFeature?.properties ?? {}

      // ONLY the client's explicit GIS landmark flag controls
      // whether this feature becomes a landmark.
      const isGISLandmark = ['yes', 'true', '1'].includes(
        String(
          props.Landmarks ??
          props.landmarks ??
          '',
        )
          .trim()
          .toLowerCase(),
      )

      if (!isGISLandmark) continue

      const geometry = sourceFeature.geometry

      if (!geometry || !geometry.coordinates) {
        continue
      }

      const centroid =
        geometry.type === 'Polygon' ||
        geometry.type === 'MultiPolygon'
          ? centroidOfPolygon(
              geometry.coordinates,
            )
          : null

      if (
        !centroid ||
        !Array.isArray(centroid) ||
        centroid.length < 2
      ) {
        continue
      }

      const [lng, lat] = centroid

      const name =
        props.bldg_namee ??
        props.bldg_name ??
        props.building_name ??
        props.landmarkName ??
        props.name ??
        props.Name ??
        'Unknown place'

      const derivedProps = {
        ...props,

        source: 'clientBuildings',
        derivedCategory: 'landmark',
        isGISLandmark: true,

        // Display name comes directly from the new GIS.
        name: String(name).trim(),

        // Preserve the exact original polygon.
        sourceFeature,
      }

      features.push({
        type: 'Feature',
        properties: derivedProps,

        // This point is only for the marker/list.
        // sourceFeature above remains the authoritative geometry.
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      })
    } catch (error) {
      console.warn(
        '[geoJsonUtils] Skipping invalid GIS landmark:',
        error,
      )
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}