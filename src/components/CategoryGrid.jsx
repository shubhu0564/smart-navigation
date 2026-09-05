import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'
import { filterGeoJsonBySite } from '../utils/geoJsonUtils'

/*
 * ============================================================
 * CLIENT APPROVED CATEGORY DATA
 * ============================================================
 *
 * These names come directly from the client's latest list.
 *
 * IMPORTANT:
 * The same place can intentionally exist in more than one
 * category.
 */

const PLACE_DEFINITIONS = {
  landmark: [
    {
      name: 'Kishore Kumar Bagh',
      number: 1,
    },
    {
      name: 'Kaifi Azmi Park & Vijay Tendulkar Amphitheatre',
      number: 2,
    },
    {
      name: 'Kamla Raheja Vidyanidhi institute for architecture and environmental studies',
      number: 3,
    },
    {
      name: 'Vrajlal Parekh Vidyanidhi High School',
      number: 4,
    },
    {
      name: 'Manoj Kumar Garden',
      number: 5,
    },
    {
      name: 'Smt SB Aarya Vidya Mandir',
      number: 6,
    },
    {
      name: 'Lokmanya Tilak Udyan',
      number: 7,
    },
    {
      name: 'Ecole Mondiale World School',
      number: 8,
    },
    {
      name: 'Gujarath Bhavan',
      number: 9,
    },
    {
      name: 'Goa Bhavan',
      number: 10,
    },
    {
      name: 'CDAC – Centre For Development of Advance Computing',
      number: 11,
    },
    {
      name: 'Juhu Club Millennium',
      number: 12,
    },
    {
      name: 'Shree Kalimata Temple',
      number: 13,
    },
  ],

  park: [
    {
      name: 'Kishore Kumar Bagh',
      number: 1,
    },
    {
      name: 'Kaifi Azmi Park',
      number: 2,
    },
    {
      name: 'Manoj Kumar Garden',
      number: 3,
    },
    {
      name: 'Lokmanya Tilak Udyan',
      number: 4,
    },
  ],

  busStop: [
    {
      name: 'Sukhmani Society BEST Bus Stop',
      number: 1,
    },
    {
      name: 'Saurashtra Society BEST Bus Stop',
      number: 2,
    },
    {
      name: 'JVPD BEST Bus Stop',
      number: 3,
    },
    {
      name: 'Juhu Shopping Center BEST Bus Stop',
      number: 4,
    },
    {
      name: 'Gangadip BEST Bus Stop',
      number: 5,
    },
    {
      name: 'Irla Masjid BEST Bus Stop',
      number: 6,
    },
  ],

  educationalInstitute: [
    {
      name: 'Kamla Raheja Vidyanidhi institute for architecture and environmental studies',
      number: 1,
    },
    {
      name: 'Vrajlal Parekh Vidyanidhi High School',
      number: 2,
    },
    {
      name: 'Smt SB Aarya Vidya Mandir',
      number: 3,
    },
    {
      name: 'Ecole Mondiale World School',
      number: 4,
    },
  ],

  governmentBuilding: [
    {
      name: 'Goa Bhavan',
      number: 1,
    },
    {
      name: 'Gujarath Bhavan',
      number: 2,
    },
    {
      name: 'CDAC – Centre For Development of Advance Computing',
      number: 3,
    },
  ],
}

/*
 * ============================================================
 * NAME NORMALIZATION
 * ============================================================
 *
 * Keeps spaces so aliases work correctly.
 */

const normalise = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[–—-]/g, ' ')
    .replace(/[.,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/*
 * ============================================================
 * CLIENT NAME ALIASES
 * ============================================================
 *
 * GeoJSON may use slightly different spellings.
 */

const ALIAS_MAP = {
  'kishore kumar bagh': [
    'kishore kumar bagh',
  ],

  'kaifi azmi park and vijay tendulkar amphitheatre': [
    'kaifi azmi park and vijay tendulkar amphitheatre',
    'kaifi azmi park',
    'vijay tendulkar amphitheatre',
    'vijay tendulkar amphitheater',
  ],

  'kamla raheja vidyanidhi institute for architecture and environmental studies': [
    'kamla raheja vidyanidhi institute for architecture and environmental studies',
    'kamla raheja vidyanidhi institute for architecture environmental studies',
    'kamla raheja vidyanidhi',
    'kamla rheja vidyanidhi institute for architecture and environmental studies',
    'kamla rheja vidyanidhi',
    'krvia',
    'kamala raheja vidyamandir',
  ],

  'vrajlal parekh vidyanidhi high school': [
    'vrajlal parekh vidyanidhi high school',
    'vrajlal parekh vidyanidhi',
    'vrajlal parakh vidyanidhi',
    'vrajlal parekh',
  ],

  'manoj kumar garden': [
    'manoj kumar garden',
  ],

  'smt sb aarya vidya mandir': [
    'smt sb aarya vidya mandir',
    'sb aarya vidya mandir',
    'aarya vidya mandir',
    'smt sb kumar vishya mandir',
  ],

  'lokmanya tilak udyan': [
    'lokmanya tilak udyan',
    'tilak udyan',
  ],

  'ecole mondiale world school': [
    'ecole mondiale world school',
    'ecole mondiale',
  ],

  'gujarath bhavan': [
    'gujarath bhavan',
    'gujarat bhavan',
  ],

  'goa bhavan': [
    'goa bhavan',
  ],

  'cdac centre for development of advance computing': [
    'cdac centre for development of advance computing',
    'cdac centre for development of advanced computing',
    'cdac',
    'centre for development of advance computing',
    'centre for development of advanced computing',
  ],

  'juhu club millennium': [
    'juhu club millennium',
    'juhu club',
  ],

  'shree kalimata temple': [
    'shree kalimata temple',
    'kalimata temple',
  ],

  'sukhmani society best bus stop': [
    'sukhmani society best bus stop',
    'sukhmani society',
  ],

  'saurashtra society best bus stop': [
    'saurashtra society best bus stop',
    'saurashtra society',
  ],

  'jvpd best bus stop': [
    'jvpd best bus stop',
    'jvpd bus stop',
    'jvpd',
  ],

  'juhu shopping center best bus stop': [
    'juhu shopping center best bus stop',
    'juhu shopping centre best bus stop',
    'juhu shopping center',
    'juhu shopping centre',
  ],

  'gangadip best bus stop': [
    'gangadip best bus stop',
    'gangadip bus stop',
    'gangadip',
  ],

  'irla masjid best bus stop': [
    'irla masjid best bus stop',
    'irla masjid bus stop',
    'irla masjid',
  ],
}

const aliasesFor = (name) => {
  const normalizedName = normalise(name)

  const aliases =
    ALIAS_MAP[normalizedName]

  if (aliases) {
    return aliases.map(normalise)
  }

  return [normalizedName]
}

/*
 * ============================================================
 * FEATURE HELPERS
 * ============================================================
 */

const featureLabel = (feature) => {
  const p = feature?.properties || {}

  return (
    p.bldg_namee ??
    p.bldg_name ??
    p.building_name ??
    p.landmarkName ??
    p.name ??
    p.Name ??
    p.stop_name ??
    p.stopName ??
    ''
  )
}

const featureNumber = (feature) => {
  const p = feature?.properties || {}

  return (
    p.bldg_no ??
    p.building_no ??
    p.buildingNo ??
    p.landmarkNo ??
    p.landmark_no ??
    p.No ??
    p.no ??
    p.Number ??
    p.number ??
    p.stop_no ??
    p.stopNo ??
    p.id ??
    p.ID ??
    ''
  )
}

/*
 * ============================================================
 * CATEGORY ID NORMALIZATION
 * ============================================================
 */

const canonicalCategoryId = (id) => {
  const value = normalise(id).replace(/\s+/g, '')

  if (
    [
      'landmark',
      'landmarks',
      'corporationlandmark',
      'corporationlandmarks',
    ].includes(value)
  ) {
    return 'landmark'
  }

  if (
    [
      'park',
      'parkplayground',
      'parkandplayground',
      'playground',
    ].includes(value)
  ) {
    return 'park'
  }

  if (
    [
      'busstop',
      'busstops',
      'bestbusstop',
      'bestbusstops',
    ].includes(value)
  ) {
    return 'busStop'
  }

  if (
    [
      'educationalinstitute',
      'educational',
      'education',
    ].includes(value)
  ) {
    return 'educationalInstitute'
  }

  if (
    [
      'governmentbuilding',
      'government',
      'govbuilding',
    ].includes(value)
  ) {
    return 'governmentBuilding'
  }

  return id
}

export default function CategoryGrid({
  showCards = true,
  showPlacesList = true,
}) {
  const {
    language,
    selectedCategory,
    setSelectedCategory,
    darkMode,
    categories,
    landmarks,
    setSelectedLandmark,
    geoJson,
  } = useNavigation()

  const [openCategoryId, setOpenCategoryId] =
    useState(null)
const [showCategoryPopup, setShowCategoryPopup] =
  useState(false)
  /*
   * ==========================================================
   * FIND CATEGORY
   * ==========================================================
   */

  const findCategory = (ids, fallback) => {
    const normalizedIds = ids.map((id) =>
      canonicalCategoryId(id),
    )

    const found = categories?.find(
      (category) =>
        normalizedIds.includes(
          canonicalCategoryId(category.id),
        ),
    )

    return found || fallback
  }

  /*
   * ==========================================================
   * FIXED CLIENT CATEGORY ORDER + COUNTS
   * ==========================================================
   */

  const orderedCategories = useMemo(() => {
    return [
      findCategory(
        ['landmark'],
        {
          id: 'landmark',
          label: {
            en: 'Landmark',
            mr: 'लँडमार्क',
          },
          icon: 'Landmark',
          count:
            PLACE_DEFINITIONS.landmark.length,
        },
      ),

      findCategory(
        ['park'],
        {
          id: 'park',
          label: {
            en: 'Park & Playground',
            mr: 'पार्क आणि खेळाचे मैदान',
          },
          icon: 'Trees',
          count:
            PLACE_DEFINITIONS.park.length,
        },
      ),

      findCategory(
        ['busStop'],
        {
          id: 'busStop',
          label: {
            en: 'BEST Bus Stops',
            mr: 'BEST बस थांबे',
          },
          icon: 'Bus',
          count:
            PLACE_DEFINITIONS.busStop.length,
        },
      ),

      findCategory(
        ['educationalInstitute'],
        {
          id: 'educationalInstitute',
          label: {
            en: 'Educational Institute',
            mr: 'शैक्षणिक संस्था',
          },
          icon: 'School',
          count:
            PLACE_DEFINITIONS.educationalInstitute
              .length,
        },
      ),

      findCategory(
        ['governmentBuilding'],
        {
          id: 'governmentBuilding',
          label: {
            en: 'Government Building',
            mr: 'शासकीय इमारत',
          },
          icon: 'Building2',
          count:
            PLACE_DEFINITIONS.governmentBuilding
              .length,
        },
      ),
    ]
  }, [categories])

  /*
   * ==========================================================
   * FIND LANDMARK DATA
   * ==========================================================
   */

  const findLandmarkForName = (name) => {
    const aliases = aliasesFor(name)

    return (
      landmarks?.find((item) => {
        const itemName = normalise(
          item?.name,
        )

        return aliases.some(
          (alias) =>
            itemName === alias ||
            itemName.includes(alias) ||
            alias.includes(itemName),
        )
      }) || null
    )
  }

  /*
   * ==========================================================
   * FIND BUILDING GIS FEATURE
   * ==========================================================
   *
   * IMPORTANT:
   * We use the actual GeoJSON geometry.
   * No fake latitude/longitude is generated.
   */

  /*
   * ==========================================================
   * FIND FEATURE FROM ALL GIS DATASETS
   * ==========================================================
   *
   * Different categories come from different GeoJSON layers:
   *   - BEST bus stops       -> busStops
   *   - parks/playgrounds    -> parkPlayground
   *   - landmarks/buildings  -> clientBuildings / landmarks
   *   - other civic places   -> clientBuildings / landmarks
   *
   * We therefore do NOT assume that every category is stored in
   * clientBuildings. The resolver searches the correct layer first
   * and then safely falls back to the other available feature layers.
   */

  /* VERIFIED CORPORATION LANDMARK GEOMETRY
   * Uses only exact verified names from the old client_buildings GeoJSON.
   * No building-number fallback is used.
   */
  const getVerifiedCorporationLandmarks = () => {
    const source = geoJson?.clientBuildings
    if (!source || !Array.isArray(source.features)) {
      return { type: 'FeatureCollection', features: [] }
    }

    // Use the actual landmark polygons from client_buildings.
    // Matching is based on the requested landmark names/aliases, so
    // spelling differences such as "Rheja" vs "Raheja" do not break
    // the Landmark category button on mobile.
    const definitions = PLACE_DEFINITIONS.landmark || []
    const used = new Set()
    const features = []

    definitions.forEach((place) => {
      const aliases = aliasesFor(place.name)
      const match = source.features.find((feature, index) => {
        if (used.has(index)) return false

        const props = feature?.properties || {}
        const rawName =
          props.bldg_namee ?? props.bldg_name ??
          props.building_name ?? props.name ?? props.Name ?? ''
        const current = normalise(rawName)
        if (!current) return false

        return aliases.some((alias) => {
          if (!alias) return false
          if (current === alias) return true
          if (current.includes(alias) || alias.includes(current)) return true

          // Handle common spelling/wording differences while still
          // requiring meaningful overlap.
          const words = new Set(current.split(' '))
          const aliasWords = alias.split(' ')
          const common = aliasWords.filter((word) => words.has(word))
          return common.length >= Math.min(2, aliasWords.length)
        })
      })

      if (!match) return

      const matchIndex = source.features.indexOf(match)
      used.add(matchIndex)

      features.push({
        ...match,
        properties: {
          ...(match.properties || {}),
          id: `corporation-landmark-${place.number}`,
          landmarkNo: place.number,
          landmarkName: place.name,
          name: place.name,
          category: 'corporationLandmark',
          categoryLabel: 'Corporation Landmark',
        },
      })
    })

    const result = { type: 'FeatureCollection', features }
    return geoJson?.siteBoundary
      ? filterGeoJsonBySite(result, geoJson.siteBoundary)
      : result
  }

  const getFeatureCollectionsForCategory = (category) => {
    const canonical = canonicalCategoryId(category)
    const collections = []

    const add = (value) => {
      if (!value || !Array.isArray(value.features)) return
      if (!collections.includes(value)) collections.push(value)
    }

    if (canonical === 'busStop') {
      add(geoJson.busStops)
    }

    if (canonical === 'educationalInstitute') {
      const educationBuildings = geoJson.clientBuildings
        ? {
            ...geoJson.clientBuildings,
            features: geoJson.clientBuildings.features.filter((feature) =>
              ['yes', 'true', '1'].includes(
                String(feature?.properties?.Edu_Bldg ?? '').trim().toLowerCase(),
              ),
            ),
          }
        : null

      add(educationBuildings)

      // Educational places must resolve only against Edu_Bldg features.
      return collections
    }

    if (canonical === 'park') {
      add(geoJson.parkPlayground)
      add(geoJson.openSpaces)
    }

    // Landmarks can come from the verified corporation-building layer,
    // the park/playground layer, or the client building layer.
    // Searching all three is important because some named landmarks
    // (for example gardens/parks) are not building polygons.
    if (canonical === 'landmark') {
      add(getVerifiedCorporationLandmarks())
      add(geoJson.parkPlayground)
      add(geoJson.openSpaces)
      add(geoJson.landmarks)
      add(geoJson.corporationLandmarks)
    }

    // Generic buildings remain a fallback for other named places.
    add(geoJson.clientBuildings)

    // Keep the existing landmark collection as a fallback because it
    // may already contain a feature linked to a named place.
    const linkedLandmarkFeatures = Array.isArray(landmarks)
      ? landmarks.map((item) => item?.feature).filter(Boolean)
      : []

    if (linkedLandmarkFeatures.length > 0) {
      add({ type: 'FeatureCollection', features: linkedLandmarkFeatures })
    }

    add(geoJson.landmarks)
    add(geoJson.corporationLandmarks)

    return collections
  }

  const featureMatchesName = (feature, aliases) => {
    const current = normalise(featureLabel(feature))
    if (!current) return false

    return aliases.some((alias) => {
      if (!alias) return false

      // Exact match is strongest.
      if (current === alias) return true

      // Avoid matching a very short word inside an unrelated name.
      const currentWords = current.split(' ')
      const aliasWords = alias.split(' ')
      const currentSet = new Set(currentWords)
      const aliasSet = new Set(aliasWords)
      const commonWords = aliasWords.filter((word) => currentSet.has(word))

      if (commonWords.length >= Math.min(2, aliasWords.length)) {
        return true
      }

      return current.includes(alias) || alias.includes(current)
    })
  }

  const findFeatureForName = (category, name, number = null) => {
    const aliases = aliasesFor(name)
    const collections = getFeatureCollectionsForCategory(category)

    /*
     * BUS STOP FIX:
     * The stop number is the authoritative identifier for the
     * supplied bus-stop GeoJSON. Match it BEFORE name aliases.
     *
     * This prevents selecting Stop B while the map focuses on Stop A
     * when names/aliases are similar.
     */
    if (
      canonicalCategoryId(category) === 'busStop' &&
      number !== null &&
      number !== undefined
    ) {
      const targetNumber = String(number).trim()

      if (targetNumber) {
        const busStopCollection = collections[0]

        const numberMatch = busStopCollection?.features?.find((feature) => {
          const currentNumber = String(featureNumber(feature)).trim()
          return currentNumber === targetNumber
        })

        if (numberMatch) return numberMatch
      }
    }

    // Normal categories continue with exact/strong name matching.
    for (const collection of collections) {
      const match = collection.features.find((feature) =>
        featureMatchesName(feature, aliases),
      )
      if (match) return match
    }

    // Number fallback for categories other than bus stops.
    if (number !== null && number !== undefined) {
      const targetNumber = String(number).trim()

      if (targetNumber) {
        let numberCollections = collections

        if (canonicalCategoryId(category) === 'busStop') {
          numberCollections = collections.slice(0, 1)
        } else if (canonicalCategoryId(category) === 'park') {
          numberCollections = collections.slice(0, 2)
        }

        for (const collection of numberCollections) {
          const match = collection.features.find((feature) => {
            const currentNumber = String(featureNumber(feature)).trim()
            return currentNumber === targetNumber
          })
          if (match) return match
        }
      }
    }

    return null
  }

  const findBuildingFeatureForName = (name, number = null) =>
    findFeatureForName('landmark', name, number)

  const findBusStopFeatureForName = (name, number = null) =>
    findFeatureForName('busStop', name, number)

  /*
   * ==========================================================
   * GET PLACES FOR CATEGORY
   * ==========================================================
   */

  const getPlacesForCategory = (categoryId) => {
    const canonical = canonicalCategoryId(categoryId)
    const definitions = PLACE_DEFINITIONS[canonical] || []

    return definitions.map((place, index) => {
      const feature = findFeatureForName(
        canonical,
        place.name,
        place.number,
      )

      const actualNumber = feature
        ? featureNumber(feature)
        : place.number

      const resolvedName =
        String(place?.name ?? '').trim() ||
        String(featureLabel(feature) ?? '').trim() ||
        `${canonical === 'landmark' ? 'Landmark' : canonical === 'park' ? 'Park / Playground' : canonical === 'busStop' ? 'Bus Stop' : 'Place'} ${index + 1}`

      return {
        ...place,
        name: resolvedName,
        number: actualNumber || place.number,
        feature,
        index,
        sourceCategory: canonical,
      }
    })
  }

  /*
   * ==========================================================
   * SELECT INDIVIDUAL PLACE
   * ==========================================================
   */

  const selectPlace = (categoryId, place, index) => {
    const canonical = canonicalCategoryId(categoryId)

    // Use the exact row that was clicked. Never fall back to row A.
    let feature = place?.feature || null
    if (!feature) {
      feature = findFeatureForName(
        canonical,
        place?.name,
        place?.number,
      )
    }

    if (!feature) {
      console.warn('[CategoryGrid] GIS feature not found:', {
        category: canonical,
        place: place?.name,
      })
      return
    }

    const properties = feature.properties || {}
    const isBusStop = canonical === 'busStop'
    const isOpenSpace =
      canonical === 'park' &&
      geoJson.openSpaces?.features?.includes(feature)

    const stopNo =
      properties.No ?? properties.no ??
      properties.Number ?? properties.number ??
      properties.stop_no ?? properties.stopNo ?? ''

    const buildingNo =
      properties.bldg_no ?? properties.building_no ??
      properties.buildingNo ?? ''

    const landmarkNo =
      properties.landmarkNo ?? properties.landmark_no ?? ''

    const selected = {
      // Unique ID prevents A and B from sharing active state.
      id:
        isBusStop
          ? (
              properties.id ??
              properties.ID ??
              properties.stop_id ??
              properties.stopId ??
              `busStop:${stopNo}:${index}`
            )
          : `category-${canonical}-${index}-${normalise(place?.name || '')}`,
      name: place.name,
      road: properties.road ?? properties.address ?? '',
      category: isOpenSpace ? 'Open Space' : canonical,
      sourceCategory: isBusStop
        ? 'busStop'
        : isOpenSpace
          ? 'openSpace'
          : canonical === 'landmark'
            ? 'corporationLandmark'
            : canonical,
      latitude: null,
      longitude: null,
      description: place.name,
      address: properties.address ?? properties.road ?? '',
      image: null,
      rating: properties.rating ?? 4.6,
      steps: [],
      landmarkNo:
        landmarkNo || (canonical === 'landmark' ? place.number : ''),
      bldg_namee:
        properties.bldg_namee ?? properties.bldg_name ??
        properties.building_name ?? place.name,
      bldg_no: buildingNo,
      stopNo,
      busStopNo: stopNo,
      feature,
      fromSearch: false,
      fromCategory: true,
      categoryId: canonical,
      categoryPlaces: [],
      selectedPlaceIndex: index,
      selectedPlaceKey:
        `${canonical}:${index}:${normalise(place.name || '')}`,
    }

    setSelectedCategory(categoryId)
    setOpenCategoryId(categoryId)
    setSelectedLandmark(selected)
  }

  /*
   * ==========================================================
   * CATEGORY CARD CLICK
   * ==========================================================
   */

  const handleCategoryClick = (category) => {
    const canonical = canonicalCategoryId(category?.id)

    // LANDMARK: always use the canonical id. Some category data uses
    // corporationLandmark/corporationLandmarks, which previously caused
    // the card state/list/focus flow to disagree on mobile.
    const effectiveCategory = canonical === 'landmark' ? 'landmark' : canonical
    const places = getPlacesForCategory(effectiveCategory)

    const features = places
      .map((place) => place?.feature)
      .filter((feature) => feature?.geometry)

    setSelectedCategory(effectiveCategory)
    setOpenCategoryId(effectiveCategory)
    setShowCategoryPopup(false)

    setSelectedLandmark({
      id: `category-group-${effectiveCategory}`,
      name: getText(category?.label, language),
      category: effectiveCategory,
      categoryId: effectiveCategory,
      sourceCategory: 'categoryGroup',
      latitude: null,
      longitude: null,
      description: getText(category?.label, language),
      address: '',
      image: null,
      rating: 4.6,
      steps: [],
      feature: null,
      categoryPlaces: places,
      categoryFeatures: features,
      fromSearch: false,
      fromCategory: false,
    })
  }

  /*
   * ==========================================================
   * OPEN CATEGORY LIST
   * ==========================================================
   */

  const listCategoryId =
    showPlacesList &&
    selectedCategory &&
    selectedCategory !== 'all'
      ? canonicalCategoryId(selectedCategory)
      : null

  const openPlaces =
    listCategoryId
      ? getPlacesForCategory(
          listCategoryId,
        )
      : []

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-3">

      {/* =====================================================
          CATEGORY CARDS
         ===================================================== */}

      {showCards ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

          {orderedCategories.map(
            (category) => {
              const Icon =
                Icons[
                  category.icon
                ] ??
                Icons.Compass

              const active =
                canonicalCategoryId(selectedCategory) ===
                canonicalCategoryId(category.id)

              return (
                <motion.button
                  type="button"
                  whileHover={{
                    y: -3,
                    scale: 1.01,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  key={
                    category.id
                  }
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    handleCategoryClick(category)
                  }}
                  onTouchEnd={(event) => {
                    event.stopPropagation()
                  }}
                  style={{ touchAction: 'manipulation' }}
                  className={`${canonicalCategoryId(category.id) === 'landmark' ? 'col-span-2 flex flex-col items-center md:col-span-2 lg:col-span-2 xl:col-span-2' : ''} rounded-[16px] border p-2 text-left shadow-sm transition duration-200 sm:rounded-[24px] sm:p-4 ${
                    active
                      ? 'border-teal-600 bg-teal-600 text-white shadow-lg'
                      : darkMode
                        ? 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-500 hover:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg sm:mb-3 sm:h-11 sm:w-11 sm:rounded-2xl ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-600/10 text-teal-600'
                    }`}
                  >
                    <Icon
                      size={16}
                      className="sm:h-5 sm:w-5"
                    />
                  </div>

                  <div className={`flex items-center gap-1 sm:gap-2 ${
                    canonicalCategoryId(category.id) === 'landmark'
                      ? 'justify-center'
                      : ''
                  }`}>
                    <p className="text-xs font-semibold leading-4 sm:text-sm sm:leading-5">
                      {getText(
                        category.label,
                        language,
                      )}
                    </p>

                    {category.count >
                    0 ? (
                      <span
                        className={`text-[10px] font-medium sm:text-xs ${
                          active
                            ? 'text-white/80'
                            : 'text-slate-500'
                        }`}
                      >
                        ({category.count})
                      </span>
                    ) : null}
                  </div>
                </motion.button>
              )
            },
          )}

        </div>
      ) : null}

     {/* =====================================================
    CATEGORY PLACES POPUP
   ===================================================== */}

{showPlacesList &&
  showCategoryPopup &&
  listCategoryId && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={() => setShowCategoryPopup(false)}
    >
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-[24px] border shadow-2xl ${
          darkMode
            ? 'border-slate-700 bg-slate-900'
            : 'border-slate-200 bg-white'
        }`}
        onClick={(event) => event.stopPropagation()}
      >

        {/* HEADER */}
        <div
          className={`flex items-center justify-between border-b px-5 py-4 ${
            darkMode
              ? 'border-slate-700'
              : 'border-slate-200'
          }`}
        >
          <div>
            <p
              className={`text-base font-bold ${
                darkMode
                  ? 'text-white'
                  : 'text-slate-900'
              }`}
            >
              {getText(
                orderedCategories.find(
                  (item) =>
                    canonicalCategoryId(item.id) ===
                    canonicalCategoryId(listCategoryId)
                )?.label || {
                  en: 'Places',
                  mr: 'ठिकाणे',
                },
                language
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Select a place to locate it on the map.
            </p>
          </div>

          {/* CLOSE */}
          <button
            type="button"
            onClick={() =>
              setShowCategoryPopup(false)
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* COUNT */}
        <div className="border-b border-slate-100 px-5 py-3">
          <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            {openPlaces.length} places
          </span>
        </div>

        {/* PLACES */}
        <div className="max-h-[65vh] overflow-y-auto">

          {openPlaces.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              No places are available for this category.
            </div>
          ) : (
            openPlaces.map((place, index) => (
              <button
                type="button"
                key={`${listCategoryId}-${place.name}-${index}`}
                onClick={() => {
                  selectPlace(
                    listCategoryId,
                    place,
                    index
                  )

                  setShowCategoryPopup(false)
                }}
                className="flex w-full items-center gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-teal-50"
              >

                {/* NUMBER */}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                  {String.fromCharCode(97 + index)}.
                </span>

                {/* NAME */}
                <div className="min-w-0 flex-1">

                  <p className="whitespace-normal break-words text-sm font-semibold leading-5 text-slate-900">
                    {place.name}
                  </p>

                  {String(
                    place.number ?? ''
                  ).trim() ? (
                    <p className="mt-1 text-xs text-slate-500">
                      No: {place.number}
                    </p>
                  ) : null}

                  {!place.feature ? (
                    <p className="mt-1 text-xs font-medium text-amber-600">
                      Location data unavailable
                    </p>
                  ) : null}

                </div>

                <Icons.ChevronRight
                  size={18}
                  className="shrink-0 text-slate-400"
                />

              </button>
            ))
          )}

        </div>

      </div>
    </div>
  )}


    </div>
  )
}