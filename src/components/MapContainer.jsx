import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  GeoJSON,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import {
  LoaderCircle,
  MapPin,
  Route,
  Clock3,
} from 'lucide-react'
import { Maximize2 } from 'lucide-react'
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
  const INITIAL_MAP_ZOOM = 16
const [showMapActions, setShowMapActions] = useState(false)

  // On phones, keep the map passive so normal page scrolling works.
  // The user activates map gestures by tapping the map.
  const isTouchDevice =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches
  const [mapInteractionActive, setMapInteractionActive] = useState(false)

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
 // ============================================================
// PARK / GRD OPEN SPACES
// Only features where "Park & Gr" = "yes" are treated as green
// ============================================================

const parkAndGroundsInSite = useMemo(() => {
  if (!openSpacesInSite) {
    return null
  }

  if (
    openSpacesInSite.type !== 'FeatureCollection' ||
    !Array.isArray(openSpacesInSite.features)
  ) {
    return null
  }

  const greenFeatures =
    openSpacesInSite.features.filter((feature) => {
      const value =
        feature?.properties?.['Park & Gr']

      return (
        String(value ?? '')
          .trim()
          .toLowerCase() === 'yes'
      )
    })

  return {
    type: 'FeatureCollection',
    features: greenFeatures,
  }
}, [openSpacesInSite]) /*
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
   * ==========================================================
   * GET FEATURE LOCATION
   *
   * GeoJSON = [longitude, latitude]
   * Leaflet  = [latitude, longitude]
   * ==========================================================
   */

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
  color = '#dc2626'
}else if (sourceCategory === 'educationalInstitute') {
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

      if (isSearchSelection && mapWrapperRef.current) {
        setMapInteractionActive(true)
        mapWrapperRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }

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

    // When the user has selected a specific place from the
    // category list, let the selected-feature effect control
    // the map. Do not immediately replace it with a
    // category-wide fitBounds.
    if (selectedLandmark?.fromCategory === true) {
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

    const isGISLandmark = ['yes', 'true', '1'].includes(
      String(properties.Landmarks ?? properties.landmarks ?? '').trim().toLowerCase(),
    )

    const landmarkNo =
      properties.landmarkNo ??
      properties.landmark_no ??
      ''

    setSelectedLandmark({
      id,
      name: buildingName,
      road: properties.road ?? properties.address ?? '',
      category: isGISLandmark ? 'Corporation Landmark' : 'Building',
      sourceCategory: isGISLandmark ? 'corporationLandmark' : 'building',
      latitude: destination.lat,
      longitude: destination.lng,
      description: buildingName,
      bldg_namee: buildingName,
      bldg_no: buildingNo,
      landmarkNo,
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

      const currentBusCategoryPlaces =
        selectedCategory === 'busStop' &&
        Array.isArray(selectedLandmark?.categoryPlaces)
          ? selectedLandmark.categoryPlaces
          : []

      const selected = {
        id:
          properties.id ??
          properties.ID ??
          properties.stop_id ??
          properties.stopId ??
          `bus-${latitude}-${longitude}`,

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
        fromSearch: false,
        fromCategory: true,
        categoryPlaces: currentBusCategoryPlaces,
        selectedPlaceIndex: currentBusCategoryPlaces.findIndex(
          (place) => place?.feature === feature
        ),
        selectedPlaceKey: `busStop:${latitude}:${longitude}:${String(name).toLowerCase()}`,
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
  if (!mapRef.current) {
    return
  }

  if (!selectedLandmark) {
    setToast({
      en: 'Select a place first, then press Get Direction.',
      mr: 'प्रथम एखादे ठिकाण निवडा, नंतर दिशा दाबा.',
    })
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
  // If a place is selected, open directions to that place.
  if (selectedLandmark) {
    const destination = getFeatureLatLng(
      selectedLandmark.feature
    )

    if (!destination) {
      setToast({
        en: 'Unable to determine this place location.',
        mr: 'या ठिकाणाचे स्थान निश्चित करता आले नाही.',
      })

      return
    }

    const destinationText =
      `${destination.lat},${destination.lng}`

    const origin = position
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

    return
  }

  // No place selected:
  // open Google Maps at the current map location.
  const mapCenter =
    mapRef.current?.getCenter()

  const latitude =
    position?.lat ??
    mapCenter?.lat ??
    center.lat

  const longitude =
    position?.lng ??
    mapCenter?.lng ??
    center.lng

  const url =
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

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

  resizeLeafletMap()

  if (active && mapRef.current) {
    setTimeout(() => {
      try {
        const map = mapRef.current

        // First refresh Leaflet's fullscreen dimensions
        map.invalidateSize({
          pan: false,
          debounceMoveend: true,
        })

        // Then fit the map to the actual site boundary
        if (geoJson.siteBoundary) {
          const boundaryLayer =
            L.geoJSON(geoJson.siteBoundary)

          const bounds =
            boundaryLayer.getBounds()

          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [60, 60],
              maxZoom: 17,
              animate: true,
            })
          }
        }
      } catch (error) {
        console.warn(
          'Unable to fit fullscreen map:',
          error
        )
      }
    }, 300)
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

          {isTouchDevice && !mapInteractionActive && (
            <div
              className="pointer-events-none absolute left-1/2 top-4 z-[900] -translate-x-1/2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md backdrop-blur sm:hidden"
            >
              Tap the map to interact
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
  zoom={INITIAL_MAP_ZOOM}
  scrollWheelZoom={true}
  dragging={true}
  touchZoom={true}
  doubleClickZoom={true}
  zoomControl={true}
  className="gis-map-black-white h-full w-full"
  eventHandlers={{
    click: () => {
      if (isTouchDevice) {
        setMapInteractionActive(true)
      }
    },
  }}
  whenCreated={(map) => {
  // Initial page:
  // only the right-side fullscreen icon is visible.
  setShowMapActions(false)

  const handleZoom = () => {
    const currentZoom = map.getZoom()

    setShowMapActions(
      currentZoom > INITIAL_MAP_ZOOM
    )
  }

  map.on('zoomend', handleZoom)
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

{/* =================================================
    CORPORATION LANDMARKS
    Client-approved landmarks
   ================================================= */}

{/* =================================================
    ROADS
    Uses the actual public/data/roads.geojson layer.
    Keep this layer above the site boundary/building base
    so the road network is visible.
   ================================================= */}

{geoJson.roads && (
  <GeoJsonLayer
    featureData={geoJson.roads}
    layerKey="roads"
    showLabels={false}
  />
)}
{/* =================================================
    RIVER / NALLAH
   ================================================= */}

{geoJson.riverNallah && (
  <GeoJsonLayer
    featureData={geoJson.riverNallah}
    layerKey="riverNallah"
    showLabels={true}
  />
)}
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

            {selectedLandmark?.feature?.geometry &&
              selectedLandmark.sourceCategory !== 'categoryGroup' && (
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

          {/* =================================================
              GIS LEGEND
              Shows ONLY in fullscreen mode.
              Current available GIS layers:
              Site Boundary, Buildings, Roads, Open Space.
             ================================================= */}
       {isFullscreen && (
 <div
  className="
    absolute
    bottom-35
     right-4
    z-[2100]
    rounded-xl
    bg-white/95
    p-4
    shadow-lg
    backdrop-blur-sm
  "
>
  
              <h3 className="mb-3 text-sm font-bold text-slate-900">
                JVPD GIS LAYERS
              </h3>

              <div className="space-y-3 text-xs text-slate-700">

                {/* SITE BOUNDARY */}
                <div className="flex items-center gap-3">
                  <span
                    className="block w-7"
                    style={{
                      borderTop: '3px dashed #dc2626',
                    }}
                  />
                  <span>Site Boundary</span>
                </div>

                {/* BUILDINGS */}
                <div className="flex items-center gap-3">
                  <span className="block h-4 w-7 rounded-sm border border-slate-500 bg-white" />
                  <span>Buildings</span>
                </div>

                {/* ROADS */}
                <div className="flex items-center gap-3">
                  <span
                    className="block w-7"
                    style={{
                      borderTop: '3px solid #6b7280',
                    }}
                  />
                  <span>Roads</span>
                </div>

                {/* OPEN SPACE */}
                <div className="flex items-center gap-3">
                  <span className="block h-4 w-7 rounded-sm border border-green-600 bg-green-100" />
                  <span>Open Space</span>
                </div>

              </div>
            </div>
          )}

          <div className={isFullscreen ? 'z-[2000]' : ''}>
         <FloatingActionBar
  onLocate={focusOnCurrentLocation}
  onNavigate={startRouting}
  onReset={resetView}
  onGoogleMaps={openGoogleMaps}
  onFullscreen={toggleFullscreen}
  onLiveGps={focusOnCurrentLocation}
  isFullscreen={isFullscreen}
  showAllActions={showMapActions}
/>
         {isFullscreen && selectedLandmark ? (
  <div className="pointer-events-auto absolute bottom-[76px] left-3 right-3 z-[2100]">
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
                const currentKey =
                  `${selectedLandmark.category}:${index}:${String(place?.name || '').toLowerCase()}:${String(
                    placeFeature?.properties?.id ?? placeFeature?.properties?.ID ?? placeFeature?.properties?.stop_id ?? placeFeature?.properties?.stopId ?? placeFeature?.properties?.No ?? placeFeature?.properties?.no ?? ''
                  )}`

                const isSelected =
                  selectedLandmark.fromCategory === true &&
                  (selectedLandmark.selectedPlaceIndex === index || selectedLandmark.selectedPlaceKey === currentKey)

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
                        id: `category-${canonical}-${index}-${String(place?.name || '').replace(/[^a-zA-Z0-9]+/g, '-')}`,
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
                          `${canonical}:${index}:${String(place?.name || '').toLowerCase()}:${String(
                            properties.id ?? properties.ID ?? properties.stop_id ?? properties.stopId ?? properties.No ?? properties.no ?? ''
                          )}`,
                      })

                      // Move the map to the exact selected bus-stop point.
                      // GeoJSON coordinates are converted by getFeatureLatLng().
                      if (
                        canonical === 'busStop' &&
                        destination &&
                        Number.isFinite(destination.lat) &&
                        Number.isFinite(destination.lng)
                      ) {
                        mapRef.current?.flyTo(
                          [destination.lat, destination.lng],
                          19,
                          { duration: 0.9 }
                        )
                      }

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