import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  GeoJSON,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import {
  LoaderCircle,
  MapPin,
  Route,
  Clock3,
  Search,
} from 'lucide-react'

import { useNavigation } from '../hooks/useNavigation'
import { useLiveLocation } from '../hooks/useLiveLocation'
import { getText } from '../utils/helpers'
import FloatingActionBar from './FloatingActionBar'
import GeoJsonLayer from './GeoJsonLayer'
import {
  filterLandmarksGeoJson,
  filterGeoJsonBySite,
  getLandmarkCategoryId,
  getLandmarkCategoryLabel,
  deriveFeatureCategory,
  extractLandmarksFromClientBuildings,
} from '../utils/geoJsonUtils'
export default function MapContainer() {
  const mapRef = useRef(null)
  const mapWrapperRef = useRef(null)
  const routingControlRef = useRef(null)

  const {
    language,
    selectedLandmark,
    setSelectedLandmark,
    selectedCategory,
    searchQuery,
    setToast,
    enabledCategories,
    setRouteInfo,
    geoJson,
    loading,
    error,
  } = useNavigation()

  const { position, accuracy, speed } = useLiveLocation()

  const [route, setRoute] = useState(null)
  const [routeDetails, setRouteDetails] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenSearch, setFullscreenSearch] = useState('')
  const [showFullscreenSearch, setShowFullscreenSearch] = useState(false)
  const [riverNallahData, setRiverNallahData] = useState(null)

  // Keep search/click focus modest instead of jumping to an overly close zoom.
  const DETAIL_ZOOM = 17.5

  /*
   * ==========================================================
   * LANDMARK FILTER
   * ==========================================================
   */

  const visibleLandmarks = useMemo(() => {
    // Derive normal landmarks from clientBuildings so placement relies
    // on building geometry as the source of truth.
    const derived = extractLandmarksFromClientBuildings(
      geoJson.clientBuildings || {
        type: 'FeatureCollection',
        features: [],
      },
    )

    const filteredBySite = geoJson.siteBoundary
      ? filterGeoJsonBySite(
          derived,
          geoJson.siteBoundary,
        )
      : derived

    return filterLandmarksGeoJson(
      filteredBySite,
      selectedCategory,
      searchQuery,
      enabledCategories,
    )
  }, [
    geoJson.clientBuildings,
    geoJson.siteBoundary,
    selectedCategory,
    searchQuery,
    enabledCategories,
  ])

  const clientBuildingsInSite = useMemo(() => (geoJson.siteBoundary && geoJson.clientBuildings) ? filterGeoJsonBySite(geoJson.clientBuildings, geoJson.siteBoundary) : geoJson.clientBuildings, [geoJson.clientBuildings, geoJson.siteBoundary])

  const busStopsInSite = useMemo(() => (geoJson.siteBoundary && geoJson.busStops) ? filterGeoJsonBySite(geoJson.busStops, geoJson.siteBoundary) : geoJson.busStops, [geoJson.busStops, geoJson.siteBoundary])

  const parkPlaygroundInSite = useMemo(() => (geoJson.siteBoundary && geoJson.parkPlayground) ? filterGeoJsonBySite(geoJson.parkPlayground, geoJson.siteBoundary) : geoJson.parkPlayground, [geoJson.parkPlayground, geoJson.siteBoundary])

  const openSpacesInSite = useMemo(() => (geoJson.siteBoundary && geoJson.openSpaces) ? filterGeoJsonBySite(geoJson.openSpaces, geoJson.siteBoundary) : geoJson.openSpaces, [geoJson.openSpaces, geoJson.siteBoundary])
  /*
   * ==========================================================
   * CORPORATION LANDMARKS
   *
   * 16 official landmarks for:
   * GULMOHAR, JVPD SCHEME
   * K/WEST WARD-67
   *
   * Their geometry comes from client_buildings.geojson.
   * ==========================================================
   */

  const CORPORATION_LANDMARKS = [
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
  ]

  const normalizeLandmarkName = (value) => {
    return String(value ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  }

  const corporationLandmarks = useMemo(() => {
    const source =
      geoJson.clientBuildings || {
        type: 'FeatureCollection',
        features: [],
      }

    if (!Array.isArray(source.features)) {
      return {
        type: 'FeatureCollection',
        features: [],
      }
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

    const features = []

    source.features.forEach((feature) => {
      const properties =
        feature?.properties || {}

      const rawName =
        properties.bldg_namee ??
        properties.bldg_name ??
        properties.building_name ??
        properties.name ??
        properties.Name ??
        ''

      const normalized =
        normalizeLandmarkName(rawName)

      if (!normalized) {
        return
      }

      let landmarkNumber =
        aliases[normalized]

      /*
       * Partial matching for names containing
       * extra text.
       */
      if (!landmarkNumber) {
        const aliasEntry =
          Object.entries(aliases).find(
            ([alias]) =>
              normalized.includes(alias) ||
              alias.includes(normalized),
          )

        landmarkNumber =
          aliasEntry?.[1]
      }

      if (!landmarkNumber) {
        return
      }

      const officialName =
        CORPORATION_LANDMARKS[
          landmarkNumber - 1
        ]

      features.push({
        ...feature,

        properties: {
          ...properties,

          id:
            `corporation-landmark-${landmarkNumber}`,

          landmarkNo:
            landmarkNumber,

          landmarkName:
            officialName,

          name:
            officialName,

          category:
            'corporationLandmark',

          categoryLabel:
            'Corporation Landmark',
        },
      })
    })

    /*
     * Remove duplicate matches.
     */
    const unique =
      Array.from(
        new Map(
          features.map((feature) => [
            feature.properties.landmarkNo,
            feature,
          ]),
        ).values(),
      )

    /*
     * Keep only features inside the site.
     */
    const result = {
      type: 'FeatureCollection',
      features: unique,
    }

    if (geoJson.siteBoundary) {
      return filterGeoJsonBySite(
        result,
        geoJson.siteBoundary,
      )
    }

    return result
  }, [
    geoJson.clientBuildings,
    geoJson.siteBoundary,
  ])
  const getFeatureLatLng = (feature) => {
    if (!feature?.geometry) {
      return null
    }

    try {
      const geometry = feature.geometry

      /*
       * POINT
       */

      if (geometry.type === 'Point') {
        const coordinates = geometry.coordinates

        if (
          !Array.isArray(coordinates) ||
          coordinates.length < 2
        ) {
          return null
        }

        const longitude = Number(coordinates[0])
        const latitude = Number(coordinates[1])

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return null
        }

        return L.latLng(latitude, longitude)
      }

      /*
       * POLYGON / MULTIPOLYGON
       */

      if (
        geometry.type === 'Polygon' ||
        geometry.type === 'MultiPolygon'
      ) {
        const layer = L.geoJSON(feature)
        const bounds = layer.getBounds()

        if (bounds.isValid()) {
          return bounds.getCenter()
        }
      }

      return null
    } catch (error) {
      console.error(
        'Unable to calculate feature location:',
        error
      )

      return null
    }
  }


  /*
   * ==========================================================
   * ENHANCED FULLSCREEN MAP SEARCH + RIVER / NALLAH
   * ==========================================================
   */

  useEffect(() => {
    let cancelled = false

    fetch('/data/river_nallah.geojson')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setRiverNallahData(data)
      })
      .catch((error) => {
        console.warn('Unable to load river_nallah.geojson:', error)
        if (!cancelled) setRiverNallahData(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const getMapSearchName = (feature, fallback = 'Unnamed place') => {
    const properties = feature?.properties || {}
    return String(
      properties.landmarkName ??
        properties.bldg_namee ??
        properties.bldg_name ??
        properties.building_name ??
        properties.stop_name ??
        properties.stopName ??
        properties.Name ??
        properties.name ??
        fallback,
    ).trim()
  }

  const getMapSearchNumber = (feature) => {
    const properties = feature?.properties || {}
    return String(
      properties.landmarkNo ??
        properties.landmark_no ??
        properties.bldg_no ??
        properties.building_no ??
        properties.buildingNo ??
        properties.No ??
        properties.no ??
        properties.Number ??
        properties.number ??
        properties.stop_no ??
        properties.stopNo ??
        '',
    ).trim()
  }

  const normalizeSearchText = (value) =>
    String(value ?? '')
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const getMapSearchValues = (feature) => {
    const properties = feature?.properties || {}
    return [
      getMapSearchName(feature),
      getMapSearchNumber(feature),
      properties.landmarkName,
      properties.bldg_namee,
      properties.bldg_name,
      properties.building_name,
      properties.name,
      properties.Name,
      properties.stop_name,
      properties.stopName,
      properties.category,
      properties.categoryLabel,
      properties.road,
      properties.address,
      properties.alias,
      properties.aliases,
      properties.search_name,
      properties.searchName,
    ]
      .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
      .map(normalizeSearchText)
      .filter(Boolean)
  }

  const buildFullscreenSearchResults = (query) => {
    const normalizedQuery = normalizeSearchText(query)
    if (!normalizedQuery) return []

    const queryTokens = normalizedQuery.split(' ').filter(Boolean)
    const results = []

    const addFeatures = (collection, sourceCategory, categoryLabel) => {
      const features = Array.isArray(collection?.features) ? collection.features : []

      features.forEach((feature, index) => {
        const name = getMapSearchName(feature)
        const number = getMapSearchNumber(feature)
        const searchableValues = getMapSearchValues(feature)
        const searchableText = searchableValues.join(' ')
        const categoryText = normalizeSearchText(categoryLabel)
        const fullSearchText = `${searchableText} ${categoryText}`.trim()

        // Token matching means "raheja" correctly finds
        // "Kamla Raheja Vidyanidhi Institute...".
        const matches = queryTokens.every((token) => fullSearchText.includes(token))
        if (!matches) return

        const exactName = normalizeSearchText(name)
        const score =
          exactName === normalizedQuery ? 0 :
          exactName.startsWith(normalizedQuery) ? 1 :
          exactName.includes(normalizedQuery) ? 2 :
          searchableText.includes(normalizedQuery) ? 3 :
          4

        results.push({
          key: `${sourceCategory}-${index}-${name}-${number}`,
          feature,
          name,
          number,
          sourceCategory,
          categoryLabel,
          score,
        })
      })
    }

    // Search every useful GIS source.
    addFeatures(corporationLandmarks, 'corporationLandmark', 'Landmark')
    addFeatures(clientBuildingsInSite, 'building', 'Building')
    addFeatures(busStopsInSite, 'busStop', 'Bus Stop')
    addFeatures(parkPlaygroundInSite, 'park', 'Park / Playground')
    addFeatures(openSpacesInSite, 'openSpace', 'Open Space')

    const unique = []
    const seen = new Set()

    results
      .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
      .forEach((item) => {
        const destination = getFeatureLatLng(item.feature)
        const key = destination
          ? `${destination.lat}:${destination.lng}:${normalizeSearchText(item.name)}`
          : item.key

        if (seen.has(key)) return
        seen.add(key)
        unique.push(item)
      })

    return unique.slice(0, 12)
  }

  const fullscreenSearchResults = useMemo(
    () => buildFullscreenSearchResults(fullscreenSearch),
    [
      fullscreenSearch,
      clientBuildingsInSite,
      busStopsInSite,
      parkPlaygroundInSite,
      openSpacesInSite,
      corporationLandmarks,
    ],
  )

  // Show useful recommendations when the search box is focused
  // before the user types anything. Once typing starts, the normal
  // search results take over.
  const recommendedSearchResults = useMemo(() => {
    const recommendations = []
    const seen = new Set()

    const addRecommendations = (collection, sourceCategory, categoryLabel, limit = 4) => {
      const features = Array.isArray(collection?.features) ? collection.features : []

      for (let index = 0; index < features.length && recommendations.length < 8; index += 1) {
        const feature = features[index]
        const name = getMapSearchName(feature)
        const number = getMapSearchNumber(feature)
        const destination = getFeatureLatLng(feature)

        if (!destination || !name || name === 'Unnamed place') continue

        const key = `${sourceCategory}:${destination.lat}:${destination.lng}:${name.toLowerCase()}`
        if (seen.has(key)) continue
        seen.add(key)

        recommendations.push({
          key: `recommended-${key}`,
          feature,
          name,
          number,
          sourceCategory,
          categoryLabel,
        })

        if (recommendations.filter((item) => item.sourceCategory === sourceCategory).length >= limit) {
          break
        }
      }
    }

    // Prioritize official landmarks, then bus stops and useful map places.
    addRecommendations(corporationLandmarks, 'corporationLandmark', 'Landmark', 4)
    addRecommendations(busStopsInSite, 'busStop', 'Bus Stop', 2)
    addRecommendations(parkPlaygroundInSite, 'park', 'Park / Playground', 2)

    return recommendations.slice(0, 8)
  }, [
    corporationLandmarks,
    busStopsInSite,
    parkPlaygroundInSite,
  ])

  const selectFullscreenSearchResult = (result) => {
    if (!result?.feature) return

    const feature = result.feature
    const properties = feature.properties || {}
    const destination = getFeatureLatLng(feature)
    if (!destination) return

    clearRouting()
    mapRef.current?.closePopup()

    const isBusStop = result.sourceCategory === 'busStop'
    const isLandmark = result.sourceCategory === 'corporationLandmark'
    const buildingNo =
      properties.bldg_no ??
      properties.building_no ??
      properties.buildingNo ??
      ''
    const landmarkNo =
      properties.landmarkNo ??
      properties.landmark_no ??
      ''
    const stopNo =
      properties.No ??
      properties.no ??
      properties.Number ??
      properties.number ??
      properties.stop_no ??
      properties.stopNo ??
      ''

    const name = result.name
    const selectedId = isBusStop
      ? `busStop:${destination.lat}:${destination.lng}:${name.toLowerCase()}`
      : `${result.sourceCategory}:${destination.lat}:${destination.lng}:${name.toLowerCase()}`

    setSelectedLandmark({
      id: selectedId,
      name,
      road: properties.road ?? properties.address ?? '',
      category: result.categoryLabel,
      categoryId: result.sourceCategory,
      sourceCategory: result.sourceCategory,
      latitude: destination.lat,
      longitude: destination.lng,
      description: name,
      address: properties.address ?? properties.road ?? '',
      image: null,
      rating: properties.rating ?? 4.6,
      steps: [],
      landmarkNo: isLandmark ? landmarkNo : '',
      bldg_namee: getMapSearchName(feature),
      bldg_no: buildingNo,
      stopNo,
      busStopNo: stopNo,
      feature,
      fromSearch: true,
      fromCategory: false,
    })

    setFullscreenSearch(name)
    setShowFullscreenSearch(false)

    if (isBusStop) {
      mapRef.current?.flyTo(
        [destination.lat, destination.lng],
        19,
        { duration: 0.9 },
      )
    } else if (
      feature.geometry?.type === 'Polygon' ||
      feature.geometry?.type === 'MultiPolygon'
    ) {
      try {
        const layer = L.geoJSON(feature)
        const bounds = layer.getBounds()
        if (bounds.isValid()) {
          mapRef.current?.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: DETAIL_ZOOM,
            animate: true,
          })
        }
      } catch {
        mapRef.current?.flyTo(
          [destination.lat, destination.lng],
          DETAIL_ZOOM,
          { duration: 0.8 },
        )
      }
    } else {
      mapRef.current?.flyTo(
        [destination.lat, destination.lng],
        DETAIL_ZOOM,
        { duration: 0.8 },
      )
    }

    setToast({
      en: `${name} selected`,
      mr: `${name} निवडले`,
    })
  }

  /*
   * ==========================================================
   * CLEAR ROUTING
   * ==========================================================
   */

  const clearRouting = () => {
    const control = routingControlRef.current

    if (control) {
      try {
        if (
          control._pendingRequest &&
          typeof control._pendingRequest.abort === 'function'
        ) {
          control._pendingRequest.abort()
        }
      } catch (error) {
        console.warn('Unable to abort routing request:', error)
      }

      try {
        const controlMap = control._map

        if (controlMap) {
          controlMap.removeControl(control)
        }
      } catch (error) {
        console.warn('Unable to remove routing control:', error)
      }
    }

    routingControlRef.current = null

    setRoute(null)
    setRouteDetails(null)

    if (typeof setRouteInfo === 'function') {
      setRouteInfo(null)
    }
  }

  /*
   * RED LOLLIPOP MARKER
   *
   * Used for every selected building and every selected
   * corporation landmark.
   */
  const createRedLollipopIcon = () =>
    L.divIcon({
      className: 'red-lollipop-marker',
      html: `
        <div style="
          position:relative;
          width:38px;
          height:54px;
          display:flex;
          justify-content:center;
          pointer-events:auto;
        ">
          <div style="
            position:absolute;
            top:0;
            width:32px;
            height:32px;
            border-radius:50%;
            background:#8B0000;
            border:3px solid #ffffff;
            box-shadow:0 3px 10px rgba(0,0,0,0.35);
          ">
            <div style="
              width:9px;
              height:9px;
              border-radius:50%;
              background:#ffffff;
              position:absolute;
              top:50%;
              left:50%;
              transform:translate(-50%,-50%);
            "></div>
          </div>

          <div style="
            position:absolute;
            top:30px;
            width:4px;
            height:20px;
            border-radius:999px;
            background:#8B0000;
            box-shadow:0 1px 3px rgba(0,0,0,0.25);
          "></div>
        </div>
      `,
      iconSize: [38, 54],
      iconAnchor: [19, 51],
      popupAnchor: [0, -48],
    })

  /*
   * ==========================================================
   * FIT MAP TO CLIENT BUILDINGS
   *
   * This is important.
   *
   * We use client_buildings.geojson as the main map extent.
   * We DO NOT use site boundary.
   * We DO NOT use roads for calculating the extent.
   * ==========================================================
   */

  useEffect(() => {
    // Fit to client buildings extent (authoritative) if available
    if (!geoJson.clientBuildings || !mapRef.current) return

    try {
      const layer = L.geoJSON(geoJson.clientBuildings)
      const bounds = layer.getBounds()

      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 17, animate: true })
      }
    } catch (error) {
      console.error('Unable to fit map to client buildings:', error)
    }
  }, [geoJson.clientBuildings])

  const createLollipopIcon = (sourceCategory = '') => {
    let color = '#0f766e'

    if (sourceCategory === 'park' || sourceCategory === 'corporationLandmark') {
      color = '#16a34a'
    } else if (sourceCategory === 'busStop') {
      color = '#0284c7'
    } else if (sourceCategory === 'educationalInstitute') {
      color = '#7c3aed'
    } else if (sourceCategory === 'communityCenter') {
      color = '#ea580c'
    } else if (sourceCategory === 'governmentBuilding') {
      color = '#475569'
    }

    return L.divIcon({
      className: 'category-lollipop-marker',
      html: `
        <div style="
          position:relative;
          width:34px;
          height:46px;
          display:flex;
          justify-content:center;
        ">
          <div style="
            position:absolute;
            top:0;
            width:30px;
            height:30px;
            border-radius:50%;
            background:${color};
            border:3px solid #ffffff;
            box-shadow:0 2px 8px rgba(0,0,0,0.30);
          "></div>
          <div style="
            position:absolute;
            top:27px;
            width:4px;
            height:16px;
            background:${color};
            border-radius:999px;
            box-shadow:0 1px 2px rgba(0,0,0,0.20);
          "></div>
        </div>
      `,
      iconSize: [34, 46],
      iconAnchor: [17, 43],
    })
  }

  const getCategoryPlaceBounds = (places = []) => {
    const bounds = L.latLngBounds([])

    places.forEach((place) => {
      const destination = getFeatureLatLng(place?.feature)
      if (destination) {
        bounds.extend([destination.lat, destination.lng])
      }
    })

    return bounds.isValid() ? bounds : null
  }

  /*
   * ==========================================================
   * SELECTED FEATURE FOCUS
   * ==========================================================
   */

  useEffect(() => {
    if (!selectedLandmark || !mapRef.current) return

    mapRef.current.closePopup()

    // Category card: fit to the complete category only.
    // The list remains below the map and no place is selected yet.
    if (
      selectedLandmark.sourceCategory === 'categoryGroup' &&
      Array.isArray(selectedLandmark.categoryPlaces) &&
      selectedLandmark.categoryPlaces.length > 0
    ) {
      const features = selectedLandmark.categoryPlaces
        .map((place) => place?.feature)
        .filter(Boolean)

      if (features.length > 0) {
        const layer = L.geoJSON({
          type: 'FeatureCollection',
          features,
        })
        const bounds = layer.getBounds()

        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            padding: [55, 55],
            maxZoom: 17.2,
            animate: true,
          })
        }
      }

      return
    }

    const feature = selectedLandmark.feature
    if (!feature) return

    try {
      const isSearchSelection =
        selectedLandmark.fromSearch === true &&
        selectedLandmark.fromCategory !== true

      // Category-list selection: focus the exact GIS feature.
      // No Leaflet popup. The React red overlay handles highlighting.
      if (selectedLandmark.fromCategory === true) {
        const featureLayer = L.geoJSON(feature)
        const bounds = featureLayer.getBounds()

        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: DETAIL_ZOOM,
            animate: true,
          })
        } else {
          const destination = getFeatureLatLng(feature)
          if (destination) {
            mapRef.current.flyTo(
              [destination.lat, destination.lng],
              DETAIL_ZOOM,
              { duration: 0.8 },
            )
          }
        }

        return
      }

      // Direct building/landmark selection: focus exact geometry.
      if (
        selectedLandmark.sourceCategory === 'building' ||
        selectedLandmark.sourceCategory === 'corporationLandmark'
      ) {
        const layer = L.geoJSON(feature)
        const bounds = layer.getBounds()

        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: DETAIL_ZOOM,
            animate: true,
          })
        } else {
          const destination = getFeatureLatLng(feature)
          if (destination) {
            mapRef.current.flyTo(
              [destination.lat, destination.lng],
              DETAIL_ZOOM,
              { duration: 0.8 },
            )
          }
        }

        return
      }

      // Bus stop and other point selections.
      const destination = getFeatureLatLng(feature)
      if (destination) {
        mapRef.current.flyTo(
          [destination.lat, destination.lng],
          DETAIL_ZOOM,
          { duration: 0.8 },
        )
      }
    } catch (error) {
      console.error('Unable to focus selected feature:', error)
    }
  }, [selectedLandmark])

  /*
   * ==========================================================
   * CATEGORY FOCUS
   * ==========================================================
   */
  useEffect(() => {
    if (!mapRef.current) return

    // Any specific feature selection (map click, category list,
    // search recommendation, or search result) owns the map view.
    // Never replace that exact location with category-wide fitBounds.
    if (selectedLandmark?.feature) {
      return
    }

    try {
      let layer = null

      if (selectedCategory === 'all') {
        if (geoJson.siteBoundary) layer = L.geoJSON(geoJson.siteBoundary)
      } else if (selectedCategory === 'busStop') {
        if (busStopsInSite) layer = L.geoJSON(busStopsInSite)
      } else if (selectedCategory === 'park') {
        if (parkPlaygroundInSite) layer = L.geoJSON(parkPlaygroundInSite)
        else if (openSpacesInSite) layer = L.geoJSON(openSpacesInSite)
      } else {
        // other categories are derived from landmarks
        const features = visibleLandmarks?.features ?? []
        if (features.length > 0) layer = L.geoJSON({ type: 'FeatureCollection', features })
      }

      if (layer) {
        const bounds = layer.getBounds()
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 18, animate: true })
        }
      }
    } catch (error) {
      console.warn('Category focus failed:', error)
    }
  }, [selectedCategory, geoJson.siteBoundary, geoJson.busStops, geoJson.parkPlayground, geoJson.openSpaces, visibleLandmarks])
  // Category focus based on landmarks has been removed to avoid using landmarks.geojson for map positioning.

  /*
   * ==========================================================
   * CURRENT LOCATION
   * ==========================================================
   */

  const center =
    position ?? {
      lat: 19.112,
      lng: 72.836,
    }

  const focusOnCurrentLocation = () => {
    if (!navigator.geolocation) {
      setToast({
        en: 'Location is not supported by this browser.',
        mr: 'हा ब्राउझर स्थानाला समर्थन देत नाही',
      })

      return
    }

    if (!mapRef.current) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const latitude =
          location.coords.latitude

        const longitude =
          location.coords.longitude

        mapRef.current.setView(
          [
            latitude,
            longitude,
          ],
          17,
          {
            animate: true,
          }
        )

        setToast({
          en: 'Centered on your location',
          mr: 'तुमच्या स्थानावर केंद्रित केले',
        })
      },
      (geoError) => {
        if (geoError.code === 1) {
          setToast({
            en: 'Location permission was denied. Please allow location access.',
            mr: 'स्थान परवानगी नाकारली गेली.',
          })
        } else if (geoError.code === 2) {
          setToast({
            en: 'Your current location is unavailable.',
            mr: 'आपले सध्याचे स्थान उपलब्ध नाही.',
          })
        } else if (geoError.code === 3) {
          setToast({
            en: 'Location request timed out. Please try again.',
            mr: 'स्थान विनंतीची मुदत संपली.',
          })
        } else {
          setToast({
            en:
              geoError.message ||
              'Unable to retrieve location.',
            mr: 'स्थान मिळविण्यात अक्षम',
          })
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )
  }

  /*
   * ==========================================================
   * FOCUS SELECTED
   * ==========================================================
   */

  const focusOnSelected = () => {
    if (
      !mapRef.current ||
      !selectedLandmark
    ) {
      return
    }

    const feature =
      selectedLandmark.feature

    if (!feature) {
      return
    }

    try {
      if (
        feature.geometry?.type === 'Polygon' ||
        feature.geometry?.type === 'MultiPolygon'
      ) {
        const layer =
          L.geoJSON(feature)

        const bounds =
          layer.getBounds()

        if (bounds.isValid()) {
          mapRef.current.fitBounds(
            bounds,
            {
              padding: [56, 56],
              maxZoom: DETAIL_ZOOM,
              animate: true,
            }
          )

          return
        }
      }

      const destination =
        getFeatureLatLng(feature)

      if (destination) {
        mapRef.current.flyTo(
          [
            destination.lat,
            destination.lng,
          ],
          DETAIL_ZOOM,
          {
            duration: 0.9,
          }
        )
      }
    } catch (error) {
      console.error(
        'Unable to focus selected location:',
        error
      )
    }
  }

  /*
   * ==========================================================
   * BUILDING CLICK
   * ==========================================================
   */

 const handleBuildingClick = (feature) => {
    const properties = feature?.properties || {}
    const destination = getFeatureLatLng(feature)

    if (!destination || !mapRef.current) {
      return
    }

    clearRouting()
    mapRef.current?.closePopup()

    const buildingName =
      properties.bldg_namee ??
      properties.bldg_name ??
      properties.building_name ??
      properties.name ??
      properties.Name ??
      'Unnamed Building'

    const buildingNo =
      properties.bldg_no ??
      properties.building_no ??
      properties.buildingNo ??
      properties.No ??
      properties.no ??
      ''

    const id =
      properties.fid_1 ??
      properties.fid ??
      properties.id ??
      properties.ID ??
      `building-${destination.lat}-${destination.lng}`

    setSelectedLandmark({
      id,
      name: buildingName,
      road: properties.road ?? properties.address ?? '',
      category: 'Building',
      sourceCategory: 'building',
      latitude: destination.lat,
      longitude: destination.lng,
      description: buildingName,
      bldg_namee: buildingName,
      bldg_no: buildingNo,
      address: properties.address ?? properties.road ?? '',
      image: null,
      rating: properties.rating ?? 4.6,
      steps: properties.steps ?? [],
      feature,
    })

    let popupLatLng = destination

    if (
      feature?.geometry?.type === 'Polygon' ||
      feature?.geometry?.type === 'MultiPolygon'
    ) {
      try {
        const layer = L.geoJSON(feature)
        const bounds = layer.getBounds()

        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            padding: [56, 56],
            maxZoom: DETAIL_ZOOM,
            animate: true,
          })
          popupLatLng = bounds.getCenter()
        }
      } catch (error) {
        console.warn('Unable to fit building:', error)
      }
    } else {
      mapRef.current.flyTo(
        [destination.lat, destination.lng],
        DETAIL_ZOOM,
        { duration: 0.8 }
      )
    }

    // Do not open a Leaflet popup for buildings.
    // The selected building is highlighted in red and its details
    // are displayed in the GIS status bar below the map.

    setToast({
      en: `${buildingName} selected`,
      mr: `${buildingName} निवडले`,
    })
  }

  const handleBusStopClick =
    (feature) => {
      const properties =
        feature?.properties || {}

      const coordinates =
        feature?.geometry?.coordinates

      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2
      ) {
        return
      }

      const longitude =
        Number(coordinates[0])

      const latitude =
        Number(coordinates[1])

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return
      }

      const name =
        properties.Name ??
        properties.name ??
        properties.NAME ??
        properties.stop_name ??
        properties.stopName ??
        'Bus Stop'

      const stopNo =
        properties.No ??
        properties.no ??
        properties.Number ??
        properties.number ??
        properties.stop_no ??
        properties.stopNo ??
        properties.Stop_No ??
        properties.STOP_NO ??
        ''

      clearRouting()
      mapRef.current?.closePopup()

     const selected = {
id: `busStop:${latitude}:${longitude}:${String(name).toLowerCase()}`,
  name,
        road: '',

        category:
          'Bus Stop',

        sourceCategory:
          'busStop',

        latitude,

        longitude,

        description:
          name,

        stopNo,
        busStopNo: stopNo,

        address: '',

        image: null,

        rating: 4.6,

        steps: [],

        feature,
      }

      setSelectedLandmark(
        selected
      )

      mapRef.current?.flyTo(
        [
          latitude,
          longitude,
        ],
        19,
        {
          duration: 0.9,
        }
      )

      const cleanNo = String(stopNo ?? '').trim()
      const cleanName = String(name ?? '').trim()

      const popupContent = `
        <div style="font-family:system-ui,sans-serif;min-width:220px;line-height:1.5;color:#0f172a;">
          <div style="font-size:17px;font-weight:800;margin-bottom:9px;color:#1d4ed8;">Bus Stop</div>
          ${cleanNo ? `<div style="font-size:14px;margin-bottom:6px;"><strong>Stop No:</strong> ${cleanNo}</div>` : ''}
          <div style="font-size:14px;"><strong>Name:</strong><br/>${cleanName || 'Bus Stop'}</div>
        </div>
      `

      L.popup({ maxWidth: 320, closeButton: true })
        .setLatLng([latitude, longitude])
        .setContent(popupContent)
        .openOn(mapRef.current)

      setToast({
        en: `${name} selected`,
        mr: `${name} निवडले`,
      })
    }

  /*
   * ==========================================================
   * START ROUTING
   * ==========================================================
   */

  const startRouting = () => {
    if (
      !selectedLandmark ||
      !mapRef.current
    ) {
      return
    }

    if (!navigator.geolocation) {
      setToast({
        en: 'Location is not supported by this browser.',
        mr: 'हा ब्राउझर स्थानाला समर्थन देत नाही',
      })

      return
    }

    const destination =
      getFeatureLatLng(
        selectedLandmark.feature
      )

    if (!destination) {
      setToast({
        en: 'Unable to determine destination.',
        mr: 'गंतव्य स्थान निश्चित करता आले नाही.',
      })

      return
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const map =
          mapRef.current

        if (!map) {
          return
        }

        const origin =
          L.latLng(
            location.coords.latitude,
            location.coords.longitude
          )

        clearRouting()

        try {
          const routingControl =
            L.Routing.control({
              waypoints: [
                origin,
                destination,
              ],

              routeWhileDragging:
                false,

              addWaypoints:
                false,

              show:
                false,

              fitSelectedRoutes:
                true,

              lineOptions: {
                styles: [
                  {
                    color: '#0f766e',
                    weight: 5,
                    opacity: 0.9,
                  },
                ],
              },

              createMarker: () => null,
            })

          routingControl.on(
            'routesfound',
            (event) => {
              try {
                if (
                  routingControlRef.current !==
                  routingControl
                ) {
                  return
                }

                const result =
                  event.routes?.[0]

                if (!result) {
                  return
                }

                const summary =
                  result.summary

                const distanceKm =
                  (
                    summary.totalDistance /
                    1000
                  ).toFixed(1)

                const walkingTime =
                  Math.max(
                    3,
                    Math.round(
                      summary.totalTime /
                      60
                    )
                  )

                const drivingTime =
                  Math.max(
                    4,
                    Math.round(
                      walkingTime / 2
                    )
                  )

                const cyclingTime =
                  Math.max(
                    4,
                    Math.round(
                      walkingTime * 0.7
                    )
                  )

                const arrivalTime =
                  new Date(
                    Date.now() +
                    walkingTime * 60000
                  ).toLocaleTimeString(
                    [],
                    {
                      hour: 'numeric',
                      minute: '2-digit',
                    }
                  )

                const routePoints =
                  result.coordinates.map(
                    (coordinate) => [
                      coordinate.lat,
                      coordinate.lng,
                    ]
                  )

                setRoute(
                  routePoints
                )

                setRouteDetails({
                  walkingDistance:
                    distanceKm,

                  walkingTime,

                  drivingTime,

                  cyclingTime,

                  nextTurn:
                    `Follow ${
                      selectedLandmark.road ||
                      'the route'
                    }`,

                  arrivalTime,

                  currentSpeed:
                    speed
                      ? `${Math.round(
                          speed * 3.6
                        )} km/h`
                      : '—',
                })

                setRouteInfo({
                  distance:
                    `${distanceKm} km`,

                  travelTime:
                    `${walkingTime} min`,

                  remainingDistance:
                    `${distanceKm} km`,

                  cyclingTime:
                    `${cyclingTime} min`,

                  drivingTime:
                    `${drivingTime} min`,

                  nextTurn:
                    `Follow ${
                      selectedLandmark.road ||
                      'the route'
                    }`,

                  arrivalTime,

                  currentSpeed:
                    speed
                      ? `${Math.round(
                          speed * 3.6
                        )} km/h`
                      : '—',
                })
              } catch (error) {
                console.warn(
                  'Route result error:',
                  error
                )
              }
            }
          )

          routingControl.on(
            'routingerror',
            () => {
              setToast({
                en: 'Unable to calculate route.',
                mr: 'मार्ग मोजता आला नाही.',
              })
            }
          )

          routingControl.addTo(
            map
          )

          routingControlRef.current =
            routingControl
        } catch (error) {
          console.error(
            'Failed to start routing:',
            error
          )

          setToast({
            en: 'Unable to start navigation.',
            mr: 'मार्गदर्शन सुरू करता आले नाही.',
          })
        }
      },
      (geoError) => {
        setToast({
          en:
            geoError?.message ||
            'Unable to retrieve your location.',
          mr: 'आपले स्थान मिळविण्यात अक्षम',
        })
      },
      {
        enableHighAccuracy:
          true,

        timeout:
          10000,

        maximumAge:
          5000,
      }
    )
  }

  /*
   * ==========================================================
   * GOOGLE MAPS
   * ==========================================================
   */

  const openGoogleMaps = () => {
    if (!selectedLandmark) {
      return
    }

    const destination =
      getFeatureLatLng(
        selectedLandmark.feature
      )

    if (!destination) {
      return
    }

    const destinationText =
      `${destination.lat},${destination.lng}`

    const origin =
      position
        ? `${position.lat},${position.lng}`
        : ''

    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destinationText}&travelmode=walking`
      : `https://www.google.com/maps/dir/?api=1&destination=${destinationText}&travelmode=walking`

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    )
  }

  /*
   * ==========================================================
   * FULLSCREEN
   * ==========================================================
   */

  // Keep the browser fullscreen surface clean.
  useEffect(() => {
    if (!isFullscreen) return

    const previousBody = document.body.style.background
    const previousHtml = document.documentElement.style.background

    document.body.style.background = '#ffffff'
    document.documentElement.style.background = '#ffffff'

    return () => {
      document.body.style.background = previousBody
      document.documentElement.style.background = previousHtml
    }
  }, [isFullscreen])

  const resizeLeafletMap = () => {
    if (!mapRef.current) return

    // Leaflet needs an explicit size refresh after the container
    // changes dimensions (especially when entering fullscreen).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          mapRef.current.invalidateSize({
            pan: false,
            debounceMoveend: true,
          })
        } catch (error) {
          console.warn(
            'Unable to resize Leaflet map:',
            error,
          )
        }
      })
    })
  }

  const toggleFullscreen =
    async () => {
      if (!mapWrapperRef.current) {
        return
      }

      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen()
        } else {
          await mapWrapperRef.current.requestFullscreen()
        }
      } catch (error) {
        console.warn(
          'Fullscreen failed:',
          error,
        )
      }
    }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active =
        document.fullscreenElement ===
        mapWrapperRef.current

      setIsFullscreen(active)

      // Wait for the browser to apply the new fullscreen
      // dimensions before asking Leaflet to recalculate.
      resizeLeafletMap()

      if (active && mapRef.current) {
        setTimeout(() => {
          try {
            mapRef.current.invalidateSize({
              pan: false,
              debounceMoveend: true,
            })
          } catch {}
        }, 250)
      }
    }

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange,
    )

    window.addEventListener(
      'resize',
      resizeLeafletMap,
    )

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      )

      window.removeEventListener(
        'resize',
        resizeLeafletMap,
      )
    }
  }, [])

  /*
   * ==========================================================
   * RESET MAP
   * ==========================================================
   */

  const resetView = () => {
    if (!mapRef.current) {
      return
    }

    // Reset to site boundary if available
    if (geoJson.siteBoundary) {
      try {
        const layer = L.geoJSON(geoJson.siteBoundary)
        const bounds = layer.getBounds()
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 17, animate: true })
          return
        }
      } catch (error) {
        console.warn('Unable to reset to site boundary:', error)
      }
    }

    mapRef.current.flyTo([center.lat, center.lng], 16, { duration: 1 })
  }

  /*
   * ==========================================================
   * SHARE LOCATION
   * ==========================================================
   */

  const shareLocation =
    async () => {
      if (!selectedLandmark) {
        return
      }

      const destination =
        getFeatureLatLng(
          selectedLandmark.feature
        )

      if (!destination) {
        return
      }

      const url =
        `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`

      if (
        typeof navigator.share ===
        'function'
      ) {
        try {
          await navigator.share({
            title:
              selectedLandmark.name,

            text:
              `${selectedLandmark.name} • ${selectedLandmark.road || ''}`,

            url,
          })
        } catch {
          // User cancelled
        }

        return
      }

      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          url
        )

        setToast({
          en: 'Location link copied',
          mr: 'स्थान लिंक कॉपी केले',
        })
      }
    }

  /*
   * ==========================================================
   * CLEANUP ROUTING
   * ==========================================================
   */

  useEffect(() => {
    return () => {
      const control =
        routingControlRef.current

      if (!control) {
        return
      }

      try {
        if (
          control._pendingRequest &&
          typeof control._pendingRequest.abort ===
            'function'
        ) {
          control._pendingRequest.abort()
        }
      } catch {}

      try {
        const controlMap =
          control._map

        if (controlMap) {
          controlMap.removeControl(
            control
          )
        }
      } catch {}

      routingControlRef.current =
        null
    }
  }, [])

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-teal-600">
            {getText(
              {
                en: 'GIS MAP',
                mr: 'GIS नकाशा',
              },
              language
            )}
          </p>
        </div>

        <div
          ref={mapWrapperRef}
          className={`relative w-full bg-slate-100 ${
            isFullscreen
              ? 'h-screen min-h-screen rounded-none'
              : 'h-[clamp(360px,62vw,560px)] sm:h-[420px] lg:h-[520px] xl:h-[560px]'
          }`}
          style={{
            touchAction: 'auto',
          }}
        >
          {/* =========================================================
              ENHANCED MAP SEARCH
              Visible only in browser fullscreen mode.
             ========================================================= */}
          {isFullscreen && (
            <div
              className="pointer-events-auto absolute left-4 right-4 top-4 z-[2300] sm:left-1/2 sm:right-auto sm:w-[min(680px,calc(100%-32px))] sm:-translate-x-1/2"
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
            >
              <div className="relative">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md">
                  <Search size={19} className="shrink-0 text-slate-500" />
                  <input
                    type="text"
                    value={fullscreenSearch}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => {
                      const value = event.target.value
                      setFullscreenSearch(value)
                      setShowFullscreenSearch(value.trim().length > 0)
                    }}
                    onFocus={() => {
                      setShowFullscreenSearch(true)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && fullscreenSearchResults[0]) {
                        selectFullscreenSearchResult(fullscreenSearchResults[0])
                      }
                      if (event.key === 'Escape') {
                        setShowFullscreenSearch(false)
                      }
                    }}
                    placeholder="Search place, number or category..."
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>

                {showFullscreenSearch && (
                  <div
                    className="mt-2 max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                    onTouchStart={(event) => event.stopPropagation()}
                  >
                    {fullscreenSearch.trim() ? (
                      fullscreenSearchResults.length > 0 ? (
                        <>
                          <div className="border-b border-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Search results
                          </div>
                          {fullscreenSearchResults.map((result) => (
                        <button
                          key={result.key}
                          type="button"
                          onClick={() => selectFullscreenSearchResult(result)}
                          className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-teal-50 active:bg-teal-100"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            {result.sourceCategory === 'busStop' ? '🚌' : '📍'}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-slate-800">
                              {result.name}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {result.number
                                ? `${result.categoryLabel} • No: ${result.number}`
                                : result.categoryLabel}
                            </span>
                          </span>
                          </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-4 text-sm text-slate-500">
                          No matching place found.
                        </div>
                      )
                    ) : (
                      <>
                        <div className="border-b border-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Recommended places
                        </div>
                        {recommendedSearchResults.map((result) => (
                          <button
                            key={result.key}
                            type="button"
                            onClick={() => selectFullscreenSearchResult(result)}
                            className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-teal-50 active:bg-teal-100"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                              {result.sourceCategory === 'busStop' ? '🚌' : result.sourceCategory === 'park' ? '🌳' : '📍'}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-slate-800">
                                {result.name}
                              </span>
                              <span className="block truncate text-xs text-slate-500">
                                {result.number
                                  ? `${result.categoryLabel} • No: ${result.number}`
                                  : result.categoryLabel}
                              </span>
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              ENHANCED MAP LEGEND
             ========================================================= */}
          {isFullscreen && (
            <div className="pointer-events-none absolute right-4 top-20 z-[2200] w-[190px] rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md sm:top-4">
              <div className="mb-3 text-sm font-bold text-slate-800">
                JVPD GIS LAYERS
              </div>

              <div className="space-y-2.5 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-3">
                  <span className="block h-3 w-3 rounded-full border-2 border-red-600 bg-transparent" />
                  <span>Site Boundary</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="block h-3 w-3 rounded-sm border border-slate-700 bg-slate-300" />
                  <span>Buildings</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="block h-[3px] w-7 bg-slate-500" />
                  <span>Roads</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="block h-3 w-3 rounded-sm border border-green-600 bg-green-100" />
                  <span>Open Space</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="block h-[4px] w-7 rounded-full bg-blue-600" />
                  <span>River / Nallah</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-slate-50/80 px-4 text-center">
              <LoaderCircle
                className="animate-spin text-teal-600"
                size={24}
              />

              <p className="text-sm text-slate-600">
                {getText(
                  {
                    en: 'Loading map data...',
                    mr: 'नकाशा डेटा लोड करत आहे...',
                  },
                  language
                )}
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-50/90 px-4 text-center text-sm text-slate-600">
              {error}
            </div>
          )}

          <style>{`
            .gis-map-black-white .leaflet-tile-pane {
              filter: grayscale(100%) contrast(92%) brightness(103%);
            }

            /* No Leaflet popup box on the map. */
            .leaflet-popup-pane {
              display: none !important;
            }
          `}</style>

          <LeafletMap
            ref={mapRef}
            center={[
              center.lat,
              center.lng,
            ]}
            zoom={16}
            scrollWheelZoom={isFullscreen}
            dragging={isFullscreen}
            touchZoom={isFullscreen}
            doubleClickZoom={isFullscreen}
            zoomControl={true}
            className="gis-map-black-white h-full w-full"
            whenCreated={(map) => {
              mapRef.current = map

              // Never leave a Leaflet popup visible.
              map.on('popupopen', (event) => {
                try {
                  map.closePopup(event.popup)
                } catch (error) {
                  console.warn(
                    'Unable to close Leaflet popup:',
                    error,
                  )
                }
              })
            }}
          >
            {/* =================================================
                SATELLITE BASE MAP
               ================================================= */}

        <TileLayer
  url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
  maxZoom={19}
  attribution='&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
/>

            {/* =================================================
                OPEN SPACES
               ================================================= */}

            {/* =================================================
                 OPEN SPACES
                ================================================= */}

            {/* =================================================
                 RIVER / NALLAH
                ================================================= */}
            {riverNallahData && (
              <GeoJSON
                key="river-nallah"
                data={riverNallahData}
                style={() => ({
                  color: '#2563eb',
                  weight: 4,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                })}
              />
            )}

            {/* =================================================
                 SITE BOUNDARY

                 Render the boundary BEFORE buildings. This keeps the
                 transparent boundary underneath the building polygons
                 so it cannot intercept building clicks.
                ================================================= */}

            {geoJson.siteBoundary && (
              <GeoJsonLayer
                featureData={geoJson.siteBoundary}
                layerKey="siteBoundary"
              />
            )}

            {/* =================================================
                CLIENT BUILDINGS

                THIS IS THE MAIN BUILDING LAYER.

                client_buildings.geojson
                contains:
                - bldg_namee
                - bldg_no
                - polygon coordinates
               ================================================= */}
{/* BUILDINGS */}
{clientBuildingsInSite && (
  <GeoJsonLayer
    featureData={clientBuildingsInSite}
    layerKey="clientBuildings"
    onFeatureClick={handleBuildingClick}
  />
)}

{/* PLAYGROUND / PARK */}
{parkPlaygroundInSite && (
  <GeoJsonLayer
    featureData={parkPlaygroundInSite}
    layerKey="parkPlayground"
  />
)}

{/* BUS STOPS */}
{/* your existing code — DON'T CHANGE */}            {/* =================================================
                CORPORATION LANDMARKS

                Client-approved landmarks
               ================================================= */}

            {corporationLandmarks?.features?.length > 0 && (
              <GeoJsonLayer
                featureData={corporationLandmarks}
                layerKey="landmarks"
                showLabels={
                  selectedCategory === 'landmark' ||
                  selectedCategory === 'landmarks'
                }
                onFeatureClick={(feature) => {
                  clearRouting()

                                    mapRef.current?.closePopup()

                  const properties =
                    feature?.properties || {}

                  const destination =
                    getFeatureLatLng(feature)

                  if (!destination) {
                    setToast({
                      en: 'Unable to determine landmark location.',
                      mr: 'लँडमार्कचे स्थान निश्चित करता आले नाही.',
                    })

                    return
                  }

                  const landmarkName =
                    properties.landmarkName ??
                    properties.name ??
                    'Corporation Landmark'

                  const landmarkNo =
                    properties.landmarkNo ??
                    '—'

                  const selected = {
                    id:
                      properties.id ??
                      `landmark-${landmarkNo}`,

                    name:
                      landmarkName,

                    road:
                      properties.road ??
                      properties.address ??
                      '',

                    category:
                      'Corporation Landmark',

                    sourceCategory:
                      'corporationLandmark',

                    landmarkNo,

                    latitude:
                      destination.lat,

                    longitude:
                      destination.lng,

                    description:
                      landmarkName,

                    address:
                      properties.address ??
                      properties.road ??
                      '',

                    image: null,

                    rating: 4.6,

                    steps: [],

                    feature,
                  }

                  setSelectedLandmark(
                    selected,
                  )

                  /*
                   * Zoom to landmark.
                   */
                  mapRef.current?.flyTo(
                    [
                      destination.lat,
                      destination.lng,
                    ],
                    18,
                    {
                      duration: 0.8,
                    },
                  )

                  setToast({
                    en: `${landmarkName} selected`,
                    mr: `${landmarkName} निवडले`,
                  })
                }}
              />
            )}

            {/* =================================================
                IMPORTANT

                OLD BUILDINGS DISABLED
                ROADS DISABLED
                SITE BOUNDARY DISABLED

                This removes the unwanted diagonal lines.
               ================================================= */}

            {/* geoJson.buildings DISABLED */}

            {/* geoJson.roads DISABLED */}

            {/* geoJson.siteBoundary DISABLED */}

            {/* =================================================
                BUS STOPS
               ================================================= */}

            {(selectedCategory === 'all' || selectedCategory === 'busStop' || enabledCategories.includes('busStop')) &&
              busStopsInSite && (
                <GeoJsonLayer
  featureData={busStopsInSite}
  layerKey="busStops"
  showLabels={selectedCategory === 'busStop'}
  onFeatureClick={handleBusStopClick}
   activeFeatureId={
     selectedLandmark?.sourceCategory === 'busStop'
       ? selectedLandmark.id
       : null
   }
/>
              )}

            {/* Landmark point markers are intentionally hidden. Building polygons are the clickable map features. */}

                        {/* =================================================
                CATEGORY — ALL MATCHING PLACES FULL RED
                Uses the exact GeoJSON geometry for every matched place.
                Points are rendered as red circles; polygons are full red.
               ================================================= */}

            {selectedLandmark?.sourceCategory === 'categoryGroup' &&
              Array.isArray(selectedLandmark.categoryPlaces) && (
                <GeoJSON
                  key={`category-red-${selectedLandmark.category}-${selectedLandmark.categoryPlaces.length}`}
                  data={{
                    type: 'FeatureCollection',
                    features: selectedLandmark.categoryPlaces
                      .map((place) => place?.feature)
                      .filter(Boolean),
                  }}
                  interactive={false}
                  style={() => ({
                    color: '#991b1b',
                    weight: 3,
                    opacity: 1,
                    fillColor: '#ef4444',
                    fillOpacity: 0.78,
                  })}
                  pointToLayer={(feature, latlng) =>
                    L.circleMarker(latlng, {
                      radius: 9,
                      color: '#991b1b',
                      weight: 3,
                      opacity: 1,
                      fillColor: '#ef4444',
                      fillOpacity: 1,
                    })
                  }
                />
              )}

            {/* =================================================
                SELECTED PLACE — FULL RED
                Works for direct building clicks and list clicks.
               ================================================= */}

            {/* =================================================
                SELECTED PLACE — FULL RED
                Works for direct building clicks and list clicks.
                Bus stops are excluded because they have their own
                selected bus-stop overlay above.
               ================================================= */}

            {selectedLandmark?.feature?.geometry &&
              selectedLandmark.sourceCategory !== 'categoryGroup' &&
              selectedLandmark.sourceCategory !== 'busStop' && (
                <GeoJSON
                  key={`selected-red-${selectedLandmark.id || selectedLandmark.selectedPlaceKey || selectedLandmark.name}`}
                  data={selectedLandmark.feature}
                  interactive={false}
                  style={() => ({
                    color: '#7f1d1d',
                    weight: 4,
                    opacity: 1,
                    fillColor: '#dc2626',
                    fillOpacity: 0.9,
                  })}
                  pointToLayer={(feature, latlng) =>
                    L.circleMarker(latlng, {
                      radius: 11,
                      color: '#7f1d1d',
                      weight: 3,
                      opacity: 1,
                      fillColor: '#dc2626',
                      fillOpacity: 1,
                    })
                  }
                />
              )}

            {/* =================================================
                CURRENT GPS LOCATION
               ================================================= */}

            {position && (
              <>
                <Circle
                  center={[
                    position.lat,
                    position.lng,
                  ]}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor:
                      '#60a5fa',
                    fillOpacity:
                      0.18,
                  }}
                  radius={Math.max(
                    accuracy ?? 25,
                    30
                  )}
                />

                <Marker
                  position={[
                    position.lat,
                    position.lng,
                  ]}
                  icon={L.divIcon({
                    className:
                      'pulse-marker',

                    html:
                      '<div class="pulse-core"></div>',

                    iconSize: [
                      20,
                      20,
                    ],

                    iconAnchor: [
                      10,
                      10,
                    ],
                  })}
                />
              </>
            )}

            {/* =================================================
                ROUTE

                Only shown after Navigate.
               ================================================= */}

            {route && (
              <Polyline
                positions={route}
                pathOptions={{
                  color: '#0f766e',
                  weight: 5,
                  opacity: 0.9,
                }}
              />
            )}

          </LeafletMap>

          <div className={isFullscreen ? 'z-[2000]' : ''}>
          <FloatingActionBar
            onLocate={
              focusOnCurrentLocation
            }

            onNavigate={
              startRouting
            }

            onReset={
              resetView
            }

            onGoogleMaps={
              openGoogleMaps
            }

            onFullscreen={
              toggleFullscreen
            }

            onLiveGps={
              focusOnCurrentLocation
            }
          />

          {isFullscreen && selectedLandmark ? (
            <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-[2100] sm:left-4 sm:right-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/98 shadow-2xl backdrop-blur">
                <div className="flex flex-col gap-3 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    {(() => {
                      const source =
                        selectedLandmark.sourceCategory || ''

                      const isBusStop =
                        source === 'busStop'

                      const isLandmark =
                        source === 'corporationLandmark'

                      const isBuilding =
                        source === 'building'

                      const typeLabel =
                        isBusStop
                          ? 'Bus stop'
                          : isLandmark
                            ? 'Landmark'
                            : isBuilding
                              ? (
                                  String(
                                    selectedLandmark.bldg_no ?? '',
                                  ).trim()
                                    ? `Building No: ${selectedLandmark.bldg_no}`
                                    : 'Building'
                                )
                              : (
                                  String(
                                    selectedLandmark.bldg_no ??
                                      selectedLandmark.landmarkNo ??
                                      '',
                                  ).trim()
                                    ? `No: ${
                                        selectedLandmark.bldg_no ??
                                        selectedLandmark.landmarkNo
                                      }`
                                    : getText(
                                        {
                                          en: 'Selected place',
                                          mr: 'निवडलेले ठिकाण',
                                        },
                                        language,
                                      )
                                )

                      const placeNo =
                        isBusStop
                          ? selectedLandmark.stopNo
                          : isLandmark
                            ? selectedLandmark.landmarkNo
                            : selectedLandmark.bldg_no

                      const icon =
                        isBusStop ? '🚌' : '📍'

                      return (
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                              isBusStop
                                ? 'bg-green-100'
                                : 'bg-red-100'
                            }`}
                          >
                            {icon}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {selectedLandmark.name ||
                                getText(
                                  {
                                    en: 'Selected place',
                                    mr: 'निवडलेले ठिकाण',
                                  },
                                  language,
                                )}
                            </p>

                            <p className="text-xs text-slate-500">
                              {String(placeNo ?? '').trim()
                                ? `${typeLabel.includes('No:') ? '' : typeLabel + ' • '}No: ${placeNo}`
                                : typeLabel}
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {routeDetails ? (
                      <>
                        <span className="flex items-center gap-1">
                          <Route size={14} />
                          {routeDetails.walkingDistance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock3 size={14} />
                          {routeDetails.walkingTime} min walk
                        </span>
                      </>
                    ) : null}

                    {selectedLandmark.feature ? (
                      <button
                        type="button"
                        onClick={openGoogleMaps}
                        className="rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
                      >
                        Get Direction
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          </div>
        </div>

        {/* =====================================================
            SELECTED LOCATION DETAILS / STATUS BAR
            All place details are shown here — not in map popups.
           ===================================================== */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {selectedLandmark ? (
              (() => {
                const source =
                  selectedLandmark.sourceCategory || ''

                const isBusStop =
                  source === 'busStop'

                const isLandmark =
                  source === 'corporationLandmark'

                const isBuilding =
                  source === 'building'

                const typeLabel =
                  isBusStop
                    ? 'Bus stop'
                    : isLandmark
                      ? 'Landmark'
                      : isBuilding
                        ? (
                            String(
                              selectedLandmark.bldg_no ?? '',
                            ).trim()
                              ? `Building No: ${selectedLandmark.bldg_no}`
                              : 'Building'
                          )
                        : (
                            String(
                              selectedLandmark.bldg_no ??
                                selectedLandmark.landmarkNo ??
                                '',
                            ).trim()
                              ? `No: ${
                                  selectedLandmark.bldg_no ??
                                  selectedLandmark.landmarkNo
                                }`
                              : getText(
                                  {
                                    en: 'Selected place',
                                    mr: 'निवडलेले ठिकाण',
                                  },
                                  language,
                                )
                          )

                const placeNo =
                  isBusStop
                    ? selectedLandmark.stopNo
                    : isLandmark
                      ? selectedLandmark.landmarkNo
                      : selectedLandmark.bldg_no

                const icon =
                  isBusStop ? '🚌' : '📍'

                return (
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                        isBusStop
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {selectedLandmark.name ||
                          getText(
                            {
                              en: 'Selected place',
                              mr: 'निवडलेले ठिकाण',
                            },
                            language,
                          )}
                      </p>

                      <p className="text-xs text-slate-500">
                        {String(placeNo ?? '').trim()
                          ? `${typeLabel.includes('No:') ? '' : typeLabel + ' • '}No: ${placeNo}`
                          : typeLabel}
                      </p>
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                {getText(
                  {
                    en: 'Live GPS tracking',
                    mr: 'थेट GPS ट्रॅकिंग',
                  },
                  language,
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {routeDetails ? (
              <>
                <span className="flex items-center gap-1">
                  <Route size={14} />
                  {routeDetails.walkingDistance} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 size={14} />
                  {routeDetails.walkingTime} min walk
                </span>
              </>
            ) : null}

            {selectedLandmark &&
              selectedLandmark.feature && (
                <button
                  type="button"
                  onClick={openGoogleMaps}
                  className="rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
                >
                  Get Direction
                </button>
              )}
          </div>
        </div>
      </motion.div>

      {/* =====================================================
          CATEGORY PLACES LIST — ALWAYS BELOW THE MAP
          The list is kept independently from the selected place.
         ===================================================== */}

      {selectedLandmark?.categoryPlaces &&
        Array.isArray(selectedLandmark.categoryPlaces) &&
        selectedLandmark.categoryPlaces.length > 0 && (
          <section className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                    {typeof selectedLandmark.name === 'string'
                      ? selectedLandmark.name
                      : selectedLandmark.category || 'Places'}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Select a place to highlight it on the map.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                  {selectedLandmark.categoryPlaces.length} places
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {selectedLandmark.categoryPlaces.map((place, index) => {
                const placeFeature = place?.feature
                const isSelected =
                  selectedLandmark.fromCategory === true &&
                  selectedLandmark.selectedPlaceIndex === index

                return (
                  <button
                    key={`map-category-place-${selectedLandmark.category}-${index}-${place?.name || 'place'}`}
                    type="button"
                    disabled={!placeFeature}
                    onClick={() => {
                      if (!placeFeature) return

                      const properties = placeFeature.properties || {}
                      const destination = getFeatureLatLng(placeFeature)
                      const canonical = selectedLandmark.category

                      setSelectedLandmark({
                        id:
                          canonical === 'busStop' && destination
                            ? `busStop:${destination.lat}:${destination.lng}:${String(place?.name || 'Bus Stop').toLowerCase()}`
                            : `category-${canonical}-${index}-${String(place?.name || '').replace(/[^a-zA-Z0-9]+/g, '-')}`,
                        name: place?.name || 'Selected Place',
                        road: properties.road ?? properties.address ?? '',
                        category: canonical,
                        categoryId: canonical,
                        sourceCategory: canonical === 'landmark'
                          ? 'corporationLandmark'
                          : canonical,
                        latitude: destination?.lat ?? null,
                        longitude: destination?.lng ?? null,
                        description: place?.name || '',
                        address: properties.address ?? properties.road ?? '',
                        image: null,
                        rating: properties.rating ?? 4.6,
                        steps: [],
                        landmarkNo:
                          properties.landmarkNo ??
                          properties.landmark_no ??
                          (canonical === 'landmark' ? place?.number : ''),
                        bldg_namee:
                          properties.bldg_namee ??
                          properties.bldg_name ??
                          properties.building_name ??
                          place?.name ??
                          '',
                        bldg_no:
                          properties.bldg_no ??
                          properties.building_no ??
                          properties.buildingNo ??
                          '',
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
                        feature: placeFeature,
                        fromSearch: false,
                        fromCategory: true,
                        categoryPlaces: selectedLandmark.categoryPlaces,
                        selectedPlaceIndex: index,
                        selectedPlaceKey:
                          canonical === 'busStop' && destination
                            ? `busStop:${destination.lat}:${destination.lng}:${String(place?.name || 'Bus Stop').toLowerCase()}`
                            : `${canonical}:${index}:${String(place?.name || '').toLowerCase()}`,
                      })

                      clearRouting()
                      mapRef.current?.closePopup()
                    }}
                    className={`flex w-full items-center gap-3 px-5 py-4 text-left transition ${
                      !placeFeature
                        ? 'cursor-not-allowed opacity-60'
                        : isSelected
                          ? 'bg-red-50'
                          : 'hover:bg-teal-50'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-teal-50 text-teal-700'
                      }`}
                    >
                      {String.fromCharCode(97 + index)}.
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block whitespace-normal break-words text-sm font-semibold leading-5 text-slate-900">
                        {place?.name || 'Unnamed place'}
                      </span>

                      {String(place?.number ?? '').trim() ? (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          No: {place.number}
                        </span>
                      ) : null}

                      {!placeFeature ? (
                        <span className="mt-0.5 block text-xs font-medium text-amber-600">
                          Location data unavailable
                        </span>
                      ) : null}
                    </span>

                    <span className="shrink-0 text-lg text-slate-400">
                      ›
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

    </>
  )
}
