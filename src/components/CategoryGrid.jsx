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
    'Kishore Kumar Bagh',
    'Vijay Tendulkar Amphitheatre',
    'Kaifi Azmi Park',
    'Kamla Raheja Vidyanidhi Institute for Architecture & Environmental Studies',
    'Vrajlal Parekh Vidyanidhi High School',
    'Manoj Kumar Garden',
    'Smt SB Aarya Vidya Mandir',
    'Lokmanya Tilak Udyan',
    'Ecole Mondiale World School',
    'Gujarath Bhavan',
    'Goa Bhavan',
    'CDAC – Centre For Development of Advance Computing',
    'Ivy League House (Girls Hostel)',
    'Juhu Club Millennium',
    'Shree Kalimata Temple',
    'Manoranjan Park',
  ],

  park: [
    'Lokmanya Tilak Udyan',
    'Manoranjan Park',
    'Kaifi Azmi Park',
    'Manoj Kumar Garden',
    'Kishore Kumar Bagh',
  ],

  educationalInstitute: [
    'Kamla Raheja Vidyanidhi Institute for Architecture & Environmental Studies',
    'Vrajlal Parekh Vidyanidhi High School',
    'Ecole Mondiale World School',
    'Smt SB Aarya Vidya Mandir',
  ],

  communityCenter: [
    'Juhu Club Millennium',
  ],

  governmentBuilding: [
    'CDAC – Centre For Development of Advance Computing',
    'Goa Bhavan',
    'Gujarath Bhavan',
  ],
}

const normalise = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim()

const aliasesFor = (name) => {
  const n = normalise(name)

  if (n.includes('kamlaraheja')) {
    return [
      n,
      normalise('Kamla Raheja Vidyanidhi'),
      normalise('Kamala Raheja Vidyamandir'),
      normalise('Kamla Rheja Vidyanidhi institute for architecture and environmental studies'),
    ]
  }

  if (n.includes('vrajlalparekh') || n.includes('vrajlalparakh')) {
    return [
      n,
      normalise('Vrajlal Parekh Vidyanidhi'),
      normalise('Vrajlal Parakh Vidyanidhi'),
    ]
  }

  if (n.includes('ecolemondiale')) {
    return [n, normalise('Ecole Mondiale')]
  }

  if (n.includes('aaryavidyamandir') || n.includes('sbkum')) {
    return [n, normalise('Smt SB Aarya Vidya Mandir')]
  }

  if (n.includes('cdac')) {
    return [n, normalise('CDAC')]
  }

  if (n.includes('gujarath') || n.includes('gujarat')) {
    return [n, normalise('Gujarath Bhavan'), normalise('Gujarat Bhavan')]
  }

  if (n.includes('juhuclub')) {
    return [n, normalise('Juhu Club')]
  }

  return [n]
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

export default function CategoryGrid() {
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

  const findBuildingFeatureForName = (name) => {
    const aliases = aliasesFor(name)
    const features =
      geoJson.clientBuildings?.features || []

    return (
      features.find((feature) => {
        const current = normalise(
          featureLabel(feature),
        )

        return aliases.some(
          (alias) =>
            current === alias ||
            current.includes(alias) ||
            alias.includes(current),
        )
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
    const canonical = canonicalCategoryId(categoryId)

    if (canonical === 'busStop') {
      return getBusStops()
    }

    const names =
      PLACE_DEFINITIONS[canonical] || []

    return names
      .map((name, index) => {
        const landmark = findLandmarkForName(name)
        const building =
          landmark?.feature ||
          findBuildingFeatureForName(name)

        if (landmark?.feature || building) {
          return {
            name,
            number: landmark?.landmarkNo ??
              featureNumber(building) ??
              '',
            feature:
              landmark?.feature || building,
            index,
            sourceCategory:
              canonical === 'park'
                ? 'corporationLandmark'
                : canonical,
          }
        }

        return null
      })
      .filter(Boolean)
  }

  const selectPlace = (
    categoryId,
    place,
    index,
  ) => {
    const canonical =
      canonicalCategoryId(categoryId)

    const feature = place?.feature

    if (!feature) {
      console.warn(
        'No feature found for:',
        place?.name,
      )
      return
    }

    const properties =
      feature?.properties || {}

    const coords =
      featureCoordinates(feature)

    const number =
      place.number ||
      featureNumber(feature)

    const sourceCategory =
      canonical === 'park'
        ? 'corporationLandmark'
        : canonical

    setSelectedLandmark({
      id:
        properties.id ??
        properties.ID ??
        properties.fid_1 ??
        `${sourceCategory}-${index}-${normalise(place.name)}`,

      name:
        place.name ||
        featureLabel(feature) ||
        'Selected Place',

      road:
        properties.road ??
        properties.address ??
        '',

      category:
        canonical,

      sourceCategory,

      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,

      description:
        place.name ||
        featureLabel(feature) ||
        '',

      address:
        properties.address ??
        properties.road ??
        '',

      image: null,

      rating:
        properties.rating ?? 4.6,

      steps:
        properties.steps ?? [],

      landmarkNo:
        properties.landmarkNo ??
        number,

      bldg_namee:
        properties.bldg_namee ??
        featureLabel(feature),

      bldg_no:
        properties.bldg_no ??
        number,

      stopNo:
        properties.No ??
        properties.no ??
        properties.Number ??
        properties.number ??
        properties.stop_no ??
        properties.stopNo ??
        '',

      busStopNo:
        properties.No ??
        properties.no ??
        properties.Number ??
        properties.number ??
        properties.stop_no ??
        properties.stopNo ??
        '',

      feature,

      fromSearch: true,
      fromCategory: true,

      categoryPlaces: [
        {
          name: place.name,
          number,
          feature,
          sourceCategory,
        },
      ],
    })
  }

  const handleCategoryClick = (
    category,
  ) => {
    const canonical =
      canonicalCategoryId(category.id)

    const closing =
      openCategoryId === category.id

    setSelectedCategory(category.id)

    if (closing) {
      setOpenCategoryId(null)
      setSelectedLandmark(null)
      return
    }

    const places =
      getPlacesForCategory(canonical)

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

  const openPlaces =
    openCategoryId
      ? getPlacesForCategory(
          openCategoryId,
        )
      : []

  return (
    <div className="space-y-3">
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

      {openCategoryId && (
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
                        openCategoryId,
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
                    key={`${openCategoryId}-${place.name}-${index}`}
                    onClick={() =>
                      selectPlace(
                        openCategoryId,
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
