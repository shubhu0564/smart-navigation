import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'

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
      name: 'Kamla Raheja Vidyanidhi Institute for Architecture & Environmental Studies',
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
      name: 'Kamla Raheja Vidyanidhi Institute for Architecture & Environmental Studies',
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

  communityCenter: [
    {
      name: 'Juhu Club Millennium',
      number: 1,
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
      'communitycenter',
      'community',
    ].includes(value)
  ) {
    return 'communityCenter'
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
        ['communityCenter'],
        {
          id: 'communityCenter',
          label: {
            en: 'Community Center',
            mr: 'सामुदायिक केंद्र',
          },
          icon: 'Users',
          count:
            PLACE_DEFINITIONS.communityCenter
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

    if (canonical === 'park') {
      add(geoJson.parkPlayground)
      add(geoJson.openSpaces)
    }

    // Buildings are the authoritative source for the named civic
    // landmarks and institutions in the client list.
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
  const canonical = canonicalCategoryId(category)
  const aliases = aliasesFor(name)
  const collections = getFeatureCollectionsForCategory(canonical)

  /*
   * ============================================================
   * LANDMARK FIX
   * ============================================================
   *
   * IMPORTANT:
   * The new client GIS stores landmark features with:
   *
   *   Landmarks: "yes"
   *   bldg_no: 0
   *
   * Therefore NEVER use bldg_no / landmark number to find
   * a landmark.
   *
   * The landmark must be matched using its actual GIS name.
   */

  if (canonical === 'landmark') {
    const clientBuildings = geoJson?.clientBuildings

    if (!clientBuildings?.features?.length) {
      console.warn(
        '[CategoryGrid] clientBuildings GIS is missing for landmark:',
        name,
      )

      return null
    }

    const landmarkFeatures =
      clientBuildings.features.filter((feature) => {
        const properties = feature?.properties || {}

        return (
          String(properties.Landmarks || '')
            .trim()
            .toLowerCase() === 'yes'
        )
      })

    /*
     * First try an exact/alias name match.
     */
    const exactLandmark = landmarkFeatures.find((feature) => {
      const currentName = normalise(
        feature?.properties?.bldg_namee ??
          feature?.properties?.bldg_name ??
          feature?.properties?.building_name ??
          '',
      )

      if (!currentName) return false

      return aliases.some(
        (alias) => currentName === alias,
      )
    })

    if (exactLandmark) {
      return exactLandmark
    }

    /*
     * Second try the controlled alias matching.
     */
    const aliasLandmark = landmarkFeatures.find((feature) => {
      const currentName = normalise(
        feature?.properties?.bldg_namee ??
          feature?.properties?.bldg_name ??
          feature?.properties?.building_name ??
          '',
      )

      if (!currentName) return false

      return aliases.some((alias) => {
        if (!alias) return false

        const currentWords = currentName.split(' ')
        const aliasWords = alias.split(' ')

        const currentSet = new Set(currentWords)

        const commonWords = aliasWords.filter(
          (word) => currentSet.has(word),
        )

        return (
          commonWords.length >=
          Math.min(2, aliasWords.length)
        )
      })
    })

    if (aliasLandmark) {
      return aliasLandmark
    }

    /*
     * VERY IMPORTANT:
     *
     * Do NOT fall back to bldg_no for landmarks.
     *
     * If the new GIS does not contain this landmark,
     * return null instead of selecting a wrong building.
     */

    console.warn(
      '[CategoryGrid] Landmark not found in NEW GIS:',
      {
        requestedName: name,
        aliases,
        availableLandmarks:
          landmarkFeatures.map(
            (feature) =>
              feature?.properties?.bldg_namee,
          ),
      },
    )

    return null
  }

  /*
   * ============================================================
   * OTHER CATEGORIES
   * ============================================================
   */

  /*
   * First: exact/strong name matching.
   */
  for (const collection of collections) {
    const match = collection.features.find(
      (feature) =>
        featureMatchesName(feature, aliases),
    )

    if (match) {
      return match
    }
  }

  /*
   * Number fallback is allowed ONLY for categories where
   * the number belongs to that category's GIS layer.
   */
  if (
    number !== null &&
    number !== undefined
  ) {
    const targetNumber = String(number).trim()

    if (targetNumber) {
      let numberCollections = collections

      if (
        canonical === 'busStop'
      ) {
        numberCollections = collections.slice(0, 1)
      } else if (
        canonical === 'park'
      ) {
        numberCollections = collections.slice(0, 2)
      }

      for (const collection of numberCollections) {
        const match = collection.features.find(
          (feature) => {
            const currentNumber = String(
              featureNumber(feature),
            ).trim()

            return currentNumber === targetNumber
          },
        )

        if (match) {
          return match
        }
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

  // ============================================================
  // LANDMARKS
  // ============================================================
  // The NEW client GIS is the source of truth.
  // Only features explicitly marked Landmarks = yes/true/1
  // are shown as landmarks.
  // ============================================================

  if (canonical === 'landmark') {
    const features =
      geoJson?.clientBuildings?.features ?? []

    const landmarkFeatures = features.filter((feature) => {
      const properties = feature?.properties ?? {}

      return ['yes', 'true', '1'].includes(
        String(
          properties.Landmarks ??
            properties.landmarks ??
            '',
        )
          .trim()
          .toLowerCase(),
      )
    })

    return landmarkFeatures.map((feature, index) => {
      const properties = feature?.properties ?? {}

      const name =
        properties.bldg_namee ??
        properties.bldg_name ??
        properties.building_name ??
        properties.name ??
        properties.Name ??
        `Landmark ${index + 1}`

      const number =
        properties.landmarkNo ??
        properties.landmark_no ??
        ''

      return {
        id:
          properties.fid_1 ??
          properties.fid ??
          properties.id ??
          `gis-landmark-${index}`,

        name,

        number:
          number !== ''
            ? String(number)
            : String(index + 1),

        feature,

        index,

        sourceCategory: 'landmark',

        road:
          properties.road ??
          properties.address ??
          '',

        category: 'landmark',
      }
    })
  }

  // ============================================================
  // ALL OTHER CATEGORIES
  // ============================================================

  const definitions =
    PLACE_DEFINITIONS[canonical] || []

  return definitions
    .map((place, index) => {
      const feature = findFeatureForName(
        canonical,
        place.name,
        place.number,
      )

      if (!feature) {
        return null
      }

      const actualNumber =
        featureNumber(feature)

      return {
        ...place,

        number:
          actualNumber || place.number,

        feature,

        index,

        sourceCategory: canonical,
      }
    })
    .filter(Boolean)
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
        `category-${canonical}-${index}-${normalise(place?.name || '')}`,
      name: place.name,
      road: properties.road ?? properties.address ?? '',
      category: canonical,
      sourceCategory: isBusStop ? 'busStop' : canonical,
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
      categoryPlaces: openPlaces,
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
    const canonical = canonicalCategoryId(category.id)
    const isSameCategory =
      canonicalCategoryId(selectedCategory) === canonical

    if (isSameCategory) {
      setSelectedCategory('all')
      setOpenCategoryId(null)
      setSelectedLandmark(null)
      return
    }

    // Build the complete category list once. The map receives the
    // same real GIS features, so the list and red map highlight
    // always refer to the exact same places.
    const places = getPlacesForCategory(canonical)

    setSelectedCategory(category.id)
    setOpenCategoryId(category.id)
    setSelectedLandmark({
      id: `category-group-${canonical}`,
      name: category.label?.en || category.id,
      category: canonical,
      sourceCategory: 'categoryGroup',
      categoryId: canonical,
      categoryPlaces: places,
      feature: null,
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
    selectedCategory !==
      'all'
      ? selectedCategory
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
                selectedCategory ===
                category.id

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
                  onClick={() =>
                    handleCategoryClick(
                      category,
                    )
                  }
                  className={`rounded-[16px] border p-2 text-left shadow-sm transition duration-200 sm:rounded-[24px] sm:p-4 ${
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

                  <div className="flex items-center gap-1 sm:gap-2">
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

      {/* Category places are rendered below the map by MapContainer. */}


    </div>
  )
}