import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'
import { normalizeLandmarkFeature } from '../utils/geoJsonUtils'

/*
 * This version intentionally uses ONLY the utilities that were
 * already present in the original CategoryGrid.jsx.
 *
 * It does NOT import extractCorporationLandmarks(),
 * filterGeoJsonBySite(), getLandmarkCategoryId(), etc.
 * That avoids the "requested module does not provide an export"
 * runtime error that can make the whole page white.
 */

const PLACE_DEFINITIONS = {
  landmark: [
    { name: 'Kishore Kumar Bagh', number: 1 },
    { name: 'Vijay Tendulkar Amphitheatre', number: 2 },
    { name: 'Kaifi Azmi Park', number: 3 },
    { name: 'Kamla Raheja Vidyanidhi Institute for Architecture & Environmental Studies', number: 4 },
    { name: 'Vrajlal Parekh Vidyanidhi High School', number: 5 },
    { name: 'Manoj Kumar Garden', number: 6 },
    { name: 'Smt SB Aarya Vidya Mandir', number: 7 },
    { name: 'Lokmanya Tilak Udyan', number: 8 },
    { name: 'Ecole Mondiale World School', number: 9 },
    { name: 'Gujarath Bhavan', number: 10 },
    { name: 'Goa Bhavan', number: 11 },
    { name: 'CDAC – Centre For Development of Advance Computing', number: 12 },
    { name: 'Ivy League House (Girls Hostel)', number: 13 },
    { name: 'Juhu Club Millennium', number: 14 },
    { name: 'Shree Kalimata Temple', number: 15 },
    { name: 'Manoranjan Park', number: 16 },
  ],
  park: [
    { name: 'Lokmanya Tilak Udyan', number: 8 },
    { name: 'Manoranjan Park', number: 16 },
    { name: 'Kaifi Azmi Park', number: 3 },
    { name: 'Manoj Kumar Garden', number: 6 },
    { name: 'Kishore Kumar Bagh', number: 1 },
  ],
  educationalInstitute: [
    { name: 'Kamla Raheja Vidyanidhi Institute for Architecture & Environmental Studies', number: 4 },
    { name: 'Vrajlal Parekh Vidyanidhi High School', number: 5 },
    { name: 'Ecole Mondiale World School', number: 9 },
    { name: 'Smt SB Aarya Vidya Mandir', number: 7 },
  ],
  communityCenter: [
    { name: 'Juhu Club Millennium', number: 14 },
  ],
  governmentBuilding: [
    { name: 'CDAC – Centre For Development of Advance Computing', number: 12 },
    { name: 'Goa Bhavan', number: 11 },
    { name: 'Gujarath Bhavan', number: 10 },
  ],
}


const normalise = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim()

const aliasesFor = (name) => {
  const n = normalise(name)

  const aliasMap = {
    'kishore kumar bagh': ['kishore kumar bagh'],
    'vijay tendulkar amphitheatre': [
      'vijay tendulkar amphitheatre',
      'vijay tendulkar amphitheater',
    ],
    'kaifi azmi park': ['kaifi azmi park'],
    'kamla raheja vidyanidhi institute for architecture & environmental studies': [
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
    'manoj kumar garden': ['manoj kumar garden'],
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
    'goa bhavan': ['goa bhavan'],
    'cdac – centre for development of advance computing': [
      'cdac',
      'centre for development of advance computing',
      'centre for development of advanced computing',
    ],
    'ivy league house (girls hostel)': [
      'ivy league house',
      'ivy league house girls hostel',
    ],
    'juhu club millennium': [
      'juhu club millennium',
      'juhu club',
    ],
    'shree kalimata temple': [
      'shree kalimata temple',
      'kalimata temple',
    ],
    'manoranjan park': ['manoranjan park'],
  }

  return (
    aliasMap[n] ||
    [n]
  )
}

const featureLabel = (feature) => {
  const p = feature?.properties || {}

  return (
    p.bldg_namee ??
    p.bldg_name ??
    p.building_name ??
    p.landmarkName ??
    p.name ??
    p.Name ??
    ''
  )
}

const featureNumber = (feature) => {
  const p = feature?.properties || {}

  return (
    p.bldg_no ??
    p.building_no ??
    p.landmarkNo ??
    p.No ??
    p.no ??
    ''
  )
}

const featureCoordinates = (feature) => {
  const geometry = feature?.geometry

  if (!geometry) return null

  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates || []

    if (
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng))
    ) {
      return {
        lat: Number(lat),
        lng: Number(lng),
      }
    }
  }

  return null
}

export default function CategoryGrid({ showCards = true, showPlacesList = true }) {
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

  const canonicalCategoryId = (id) => {
    const value = normalise(id)

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
        'playground',
      ].includes(value)
    ) {
      return 'park'
    }

    if (
      ['busstop', 'busstops'].includes(value)
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

  const findCategory = (ids, fallback) => {
    const found = categories?.find((category) =>
      ids.includes(category.id),
    )

    return found || fallback
  }

  const orderedCategories = useMemo(() => {
    return [
      findCategory(
        ['landmark', 'landmarks', 'corporationLandmark'],
        {
          id: 'landmark',
          label: {
            en: 'Landmark',
            mr: 'लँडमार्क',
          },
          icon: 'Landmark',
          count: 16,
        },
      ),

      findCategory(
        ['park', 'parkPlayground', 'playground'],
        {
          id: 'park',
          label: {
            en: 'Park / Playground',
            mr: 'पार्क / खेळाचे मैदान',
          },
          icon: 'Compass',
          count: 5,
        },
      ),

      findCategory(
        ['busStop', 'busstop'],
        {
          id: 'busStop',
          label: {
            en: 'Bus Stop',
            mr: 'बस थांबा',
          },
          icon: 'Bus',
          count:
            geoJson.busStops?.features?.length || 6,
        },
      ),

      findCategory(
        [
          'educationalInstitute',
          'educational',
          'education',
        ],
        {
          id: 'educationalInstitute',
          label: {
            en: 'Educational Institute',
            mr: 'शैक्षणिक संस्था',
          },
          icon: 'School',
          count: 4,
        },
      ),

      findCategory(
        ['communityCenter', 'community'],
        {
          id: 'communityCenter',
          label: {
            en: 'Community Center',
            mr: 'सामुदायिक केंद्र',
          },
          icon: 'Users',
          count: 1,
        },
      ),

      findCategory(
        [
          'governmentBuilding',
          'government',
          'govBuilding',
        ],
        {
          id: 'governmentBuilding',
          label: {
            en: 'Government Building',
            mr: 'शासकीय इमारत',
          },
          icon: 'Building2',
          count: 3,
        },
      ),
    ]
  }, [categories, geoJson.busStops])

  const findLandmarkForName = (name) => {
    const aliases = aliasesFor(name)

    return (
      landmarks?.find((item) => {
        const itemName = normalise(item?.name)

        return aliases.some(
          (alias) =>
            itemName === alias ||
            itemName.includes(alias) ||
            alias.includes(itemName),
        )
      }) || null
    )
  }

  const findBuildingFeatureForName = (name, number = null) => {
    const features =
      geoJson.clientBuildings?.features || []

    const aliases = aliasesFor(name).map(normalise)

    return (
      features.find((feature) => {
        const p = feature?.properties || {}

        const current = normalise(
          p.bldg_namee ??
          p.bldg_name ??
          p.building_name ??
          p.name ??
          p.Name ??
          '',
        )

        const currentNumber = Number(
          p.landmarkNo ??
          p.landmark_no ??
          p.bldg_no ??
          p.building_no ??
          p.No ??
          p.no,
        )

        const nameMatch =
          current &&
          aliases.some(
            (alias) =>
              current === alias ||
              current.includes(alias) ||
              alias.includes(current),
          )

        const numberMatch =
          number != null &&
          Number.isFinite(Number(number)) &&
          currentNumber === Number(number)

        return nameMatch || numberMatch
      }) || null
    )
  }

  const getBusStops = () => {
    const features =
      geoJson.busStops?.features || []

    return features
      .map((feature, index) => {
        const p = feature?.properties || {}

        return {
          name:
            p.Name ??
            p.name ??
            p.NAME ??
            p.stop_name ??
            p.stopName ??
            `Bus Stop ${index + 1}`,
          number:
            p.No ??
            p.no ??
            p.Number ??
            p.number ??
            p.stop_no ??
            p.stopNo ??
            p.Stop_No ??
            p.STOP_NO ??
            '',
          feature,
          index,
        }
      })
      .slice(0, 6)
  }

  const getPlacesForCategory = (categoryId) => {
    const canonical =
      canonicalCategoryId(categoryId)

    if (canonical === 'busStop') {
      return getBusStops()
    }

    const definitions =
      PLACE_DEFINITIONS[canonical] || []

    return definitions.map(
      (place, index) => {
        const landmark =
          findLandmarkForName(place.name)

        const feature =
          landmark?.feature ||
          findBuildingFeatureForName(
            place.name,
            place.number,
          )

        return {
          ...place,
          number:
            landmark?.landmarkNo ??
            place.number ??
            '',
          feature,
          index,
          sourceCategory:
            canonical === 'park'
              ? 'corporationLandmark'
              : canonical,
        }
      },
    )
  }

  const selectPlace = (
    categoryId,
    place,
    index,
  ) => {
    const canonical =
      canonicalCategoryId(categoryId)

    let feature = place?.feature || null

    // Re-resolve from the authoritative GIS dataset at click time.
    if (!feature && canonical === 'busStop') {
      feature =
        geoJson.busStops?.features?.[place.index] ||
        null
    }

    if (!feature) {
      feature =
        findBuildingFeatureForName(
          place.name,
          place.number,
        )
    }

    if (!feature) {
      const landmark =
        findLandmarkForName(place.name)

      feature =
        landmark?.feature ||
        null
    }

    if (!feature) {
      console.warn(
        'GIS feature not found for:',
        place.name,
        place.number,
      )
      return
    }

    const properties =
      feature.properties || {}

    const sourceCategory =
      canonical === 'park'
        ? 'corporationLandmark'
        : canonical

    const stopNo =
      properties.No ??
      properties.no ??
      properties.Number ??
      properties.number ??
      properties.stop_no ??
      properties.stopNo ??
      ''

    const selected = {
      id:
        properties.id ??
        properties.ID ??
        properties.fid_1 ??
        `category-${canonical}-${index}`,

      name:
        place.name ||
        properties.landmarkName ||
        properties.bldg_namee ||
        properties.name ||
        properties.Name ||
        'Selected Place',

      road:
        properties.road ??
        properties.address ??
        '',

      category: canonical,

      sourceCategory,

      latitude: null,
      longitude: null,

      description:
        place.name ||
        properties.landmarkName ||
        properties.bldg_namee ||
        '',

      address:
        properties.address ??
        properties.road ??
        '',

      image: null,
      rating: properties.rating ?? 4.6,
      steps: [],

      landmarkNo:
        properties.landmarkNo ??
        properties.landmark_no ??
        place.number ??
        '',

      bldg_namee:
        properties.bldg_namee ??
        place.name,

      bldg_no:
        properties.bldg_no ??
        properties.building_no ??
        place.number ??
        '',

      stopNo,
      busStopNo: stopNo,

      feature,

      // These flags tell MapContainer that this was selected
      // directly from the category list.
      fromSearch: false,
      fromCategory: true,

      categoryPlaces: [
        {
          name: place.name,
          number: place.number,
          feature,
          sourceCategory,
        },
      ],
    }

    setSelectedCategory(categoryId)
    setSelectedLandmark(selected)
  }

  const handleCategoryClick = (
    category,
  ) => {
    const canonical =
      canonicalCategoryId(category.id)

    const closing =
      selectedCategory === category.id

    if (closing) {
      setSelectedCategory('all')
      setSelectedLandmark(null)
      setOpenCategoryId(null)
      return
    }

    const places =
      getPlacesForCategory(canonical)

    setSelectedCategory(category.id)
    setOpenCategoryId(category.id)

    /*
     * Keep the category-group selection lightweight.
     * The map can use categoryPlaces for group display.
     */
    setSelectedLandmark({
      id: `category-${canonical}`,
      name:
        category.label?.en ||
        canonical,
      category:
        category.label?.en ||
        canonical,
      sourceCategory: 'categoryGroup',
      categoryId: canonical,
      categoryPlaces: places,
      fromCategory: true,
      fromSearch: false,
      feature: null,
      latitude: null,
      longitude: null,
      description: '',
      steps: [],
      image: null,
      rating: 4.6,
    })
  }

  const listCategoryId =
    showPlacesList &&
    selectedCategory &&
    selectedCategory !== 'all'
      ? selectedCategory
      : null

  const openPlaces = listCategoryId
    ? getPlacesForCategory(
        listCategoryId,
      )
    : []

  const listCategory =
    listCategoryId
      ? orderedCategories.find(
          (item) =>
            item.id === listCategoryId,
        )
      : null

  return (
    <div className="space-y-3">
      {showCards ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {orderedCategories.map(
          (category) => {
            const Icon =
              Icons[category.icon] ??
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
                key={category.id}
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

      {showPlacesList && listCategoryId && (
        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`overflow-hidden rounded-[22px] border shadow-sm ${
            darkMode
              ? 'border-slate-800 bg-slate-900'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {getText(
                    orderedCategories.find(
                      (item) =>
                        item.id ===
                        listCategoryId,
                    )?.label || {
                      en: 'Places',
                      mr: 'ठिकाणे',
                    },
                    language,
                  )}
                </p>

                <p className="text-xs text-slate-500">
                  Tap a place to locate it
                  on the map.
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                {openPlaces.length}{' '}
                places
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {openPlaces.length ===
            0 ? (
              <div className="px-4 py-5 text-sm text-slate-500">
                No places are available
                for this category.
              </div>
            ) : (
              openPlaces.map(
                (
                  place,
                  index,
                ) => (
                  <button
                    type="button"
                    key={`${listCategoryId}-${place.name}-${index}`}
                    onClick={() =>
                      selectPlace(
                        listCategoryId,
                        place,
                        index,
                      )
                    }
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-teal-50 dark:hover:bg-slate-800"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                      {String.fromCharCode(
                        97 + index,
                      )}
                      .
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {place.name}
                      </p>

                      {String(
                        place.number ??
                          '',
                      ).trim() ? (
                        <p className="mt-0.5 text-xs text-slate-500">
                          No:{' '}
                          {
                            place.number
                          }
                        </p>
                      ) : null}
                    </div>

                    <Icons.ChevronRight
                      size={17}
                      className="shrink-0 text-slate-400"
                    />
                  </button>
                ),
              )
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
