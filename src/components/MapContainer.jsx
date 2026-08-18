import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  Popup,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import {
  LoaderCircle,
  MapPin,
  Route,
  Clock3,
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
            background:#dc2626;
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
            background:#dc2626;
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

    // Category card selection: display all places in the
    // category as lollipop markers and fit the map to them.
    if (
      selectedLandmark.sourceCategory === 'categoryGroup' &&
      Array.isArray(selectedLandmark.categoryPlaces) &&
      selectedLandmark.categoryPlaces.length > 0
    ) {
      const bounds = getCategoryPlaceBounds(
        selectedLandmark.categoryPlaces,
      )

      if (bounds) {
        if (selectedLandmark.categoryPlaces.length === 1) {
          const center = bounds.getCenter()
          mapRef.current.flyTo(
            [center.lat, center.lng],
            DETAIL_ZOOM,
            { duration: 0.7 },
          )
        } else {
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
      // Only a real Search result should auto-scroll the webpage to the GIS map.
      // Clicking a category place should locate it on the map but must NOT hijack page scrolling.
      const isSearchSelection =
        selectedLandmark.fromSearch === true &&
        selectedLandmark.fromCategory !== true

      if (isSearchSelection) {
        setMapInteractionActive(true)

        if (mapWrapperRef.current) {
          mapWrapperRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }


      /*
       * FINAL CATEGORY-LIST SELECTION
       *
       * The selected list item carries the exact GeoJSON feature.
       * Locate that feature and open its popup. This is independent
       * of the category name, so it works for parks, schools,
       * community centers, government buildings, landmarks and
       * bus stops.
       */
      if (selectedLandmark.fromCategory === true && feature) {
        try {
          const featureLayer = L.geoJSON(feature)
          const bounds = featureLayer.getBounds()

          const props = feature.properties || {}

          const placeName =
            selectedLandmark.name ||
            props.landmarkName ||
            props.bldg_namee ||
            props.name ||
            props.Name ||
            'Selected Place'

          const placeNo =
            selectedLandmark.landmarkNo ??
            selectedLandmark.bldg_no ??
            selectedLandmark.stopNo ??
            props.landmarkNo ??
            props.bldg_no ??
            props.No ??
            props.no ??
            ''

          let lat = selectedLandmark.latitude
          let lng = selectedLandmark.longitude

          if (bounds.isValid()) {
            const center = bounds.getCenter()
            lat = center.lat
            lng = center.lng

            mapRef.current.fitBounds(bounds, {
              padding: [55, 55],
              maxZoom: DETAIL_ZOOM,
              animate: true,
            })
          } else if (
            Number.isFinite(Number(lat)) &&
            Number.isFinite(Number(lng))
          ) {
            mapRef.current.flyTo(
              [Number(lat), Number(lng)],
              DETAIL_ZOOM,
              { duration: 0.8 },
            )
          } else {
            return
          }

          const googleMapsUrl =
            `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

          const popupContent = `
            <div style="
              font-family:system-ui,sans-serif;
              min-width:235px;
              line-height:1.5;
              color:#0f172a;
            ">
              <div style="
                font-size:17px;
                font-weight:800;
                margin-bottom:9px;
              ">
                ${placeName}
              </div>

              ${
                String(placeNo ?? '').trim()
                  ? `
                    <div style="
                      font-size:14px;
                      margin-bottom:10px;
                    ">
                      <strong>No:</strong> ${placeNo}
                    </div>
                  `
                  : ''
              }

              <a
                href="${googleMapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display:block;
                  width:100%;
                  box-sizing:border-box;
                  text-align:center;
                  text-decoration:none;
                  background:#009f91;
                  color:white;
                  padding:10px 12px;
                  border-radius:10px;
                  font-size:13px;
                  font-weight:700;
                "
              >
                Open in Google Maps
              </a>
            </div>
          `

          L.popup({
            maxWidth: 320,
            closeButton: true,
          })
            .setLatLng([lat, lng])
            .setContent(popupContent)


          return
        } catch (categoryError) {
          console.error(
            'Category place focus failed:',
            categoryError,
          )
          return
        }
      }

      const destination = getFeatureLatLng(feature)

      /*
       * BUILDING / LANDMARK SELECTION
       *
       * Every building and every corporation landmark gets the
       * same red lollipop marker. Its information opens in a
       * popup at the real polygon center.
       */
      if (
        destination &&
        (
          selectedLandmark.sourceCategory === 'building' ||
          selectedLandmark.sourceCategory === 'corporationLandmark'
        )
      ) {
        try {
          if (
            feature.geometry?.type === 'Polygon' ||
            feature.geometry?.type === 'MultiPolygon'
          ) {
            const selectedLayer = L.geoJSON(feature)
            const bounds = selectedLayer.getBounds()

            if (bounds.isValid()) {
              mapRef.current.fitBounds(bounds, {
                padding: [56, 56],
                maxZoom: DETAIL_ZOOM,
                animate: true,
              })
            }
          } else {
            mapRef.current.flyTo(
              [destination.lat, destination.lng],
              DETAIL_ZOOM,
              { duration: 0.8 },
            )
          }

          const props = feature?.properties || {}

          const isLandmark =
            selectedLandmark.sourceCategory ===
            'corporationLandmark'

          const placeName =
            selectedLandmark.name ||
            props.landmarkName ||
            props.bldg_namee ||
            props.bldg_name ||
            props.building_name ||
            props.name ||
            props.Name ||
            'Selected Place'

          const placeNo =
            isLandmark
              ? (
                  selectedLandmark.landmarkNo ??
                  props.landmarkNo ??
                  '—'
                )
              : (
                  selectedLandmark.bldg_no ??
                  props.bldg_no ??
                  props.building_no ??
                  props.No ??
                  props.no ??
                  ''
                )

          const title =
            isLandmark
              ? 'Landmark'
              : 'Building'

          const googleMapsUrl =
            `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`

          const popupContent = `
            <div style="
              font-family:system-ui,sans-serif;
              min-width:240px;
              line-height:1.5;
              color:#0f172a;
            ">
              <div style="
                font-size:17px;
                font-weight:800;
                color:#dc2626;
                margin-bottom:8px;
              ">
                ${title}
              </div>

              <div style="
                font-size:14px;
                margin-bottom:7px;
              ">
                <strong>Name:</strong><br/>
                ${placeName}
              </div>

              ${
                String(placeNo ?? '').trim()
                  ? `
                    <div style="
                      font-size:14px;
                      margin-bottom:12px;
                    ">
                      <strong>No:</strong> ${placeNo}
                    </div>
                  `
                  : ''
              }

              <a
                href="${googleMapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display:block;
                  width:100%;
                  box-sizing:border-box;
                  text-align:center;
                  text-decoration:none;
                  background:#dc2626;
                  color:#ffffff;
                  padding:10px 12px;
                  border-radius:10px;
                  font-size:13px;
                  font-weight:700;
                "
              >
                Open in Google Maps
              </a>
            </div>
          `

          L.popup({
            maxWidth: 320,
            closeButton: true,
          })
            .setLatLng([
              destination.lat,
              destination.lng,
            ])
            .setContent(popupContent)


          return
        } catch (error) {
          console.error(
            'Unable to focus selected building/landmark:',
            error,
          )
          return
        }
      }

      // CATEGORY-LIST PLACE SELECTION
      // For parks, education, community centers, government buildings
      // and landmarks, the selected list item must locate the exact
      // feature and immediately show its popup. Search behavior remains
      // unchanged below.
      if (selectedLandmark.fromCategory === true) {
        if (
          feature.geometry?.type === 'Polygon' ||
          feature.geometry?.type === 'MultiPolygon'
        ) {
          const selectedLayer = L.geoJSON(feature)
          const selectedBounds = selectedLayer.getBounds()

          if (selectedBounds.isValid()) {
            mapRef.current.fitBounds(selectedBounds, {
              padding: [70, 70],
              maxZoom: DETAIL_ZOOM,
              animate: true,
            })

            const props = feature?.properties || {}
            const placeName =
              selectedLandmark.name ||
              props.landmarkName ||
              props.bldg_namee ||
              props.bldg_name ||
              props.building_name ||
              props.name ||
              props.Name ||
              'Selected Place'

            const placeNo =
              selectedLandmark.landmarkNo ??
              props.landmarkNo ??
              props.bldg_no ??
              props.building_no ??
              props.No ??
              props.no ??
              ''

            const googleMapsUrl =
              `https://www.google.com/maps/search/?api=1&query=${selectedBounds.getCenter().lat},${selectedBounds.getCenter().lng}`

            const popupContent = `
              <div style="font-family:system-ui,sans-serif;min-width:235px;line-height:1.5;color:#0f172a;">
                <div style="font-size:17px;font-weight:800;margin-bottom:9px;">
                  ${placeName}
                </div>
                ${
                  String(placeNo ?? '').trim()
                    ? `<div style="font-size:14px;margin-bottom:10px;"><strong>No:</strong> ${placeNo}</div>`
                    : ''
                }
                <a
                  href="${googleMapsUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display:block;
                    width:100%;
                    box-sizing:border-box;
                    text-align:center;
                    text-decoration:none;
                    background:#009f91;
                    color:white;
                    padding:10px 12px;
                    border-radius:10px;
                    font-size:13px;
                    font-weight:700;
                  "
                >
                  Open in Google Maps
                </a>
              </div>
            `

            L.popup({
              maxWidth: 320,
              closeButton: true,
            })
              .setLatLng(selectedBounds.getCenter())
              .setContent(popupContent)
  

            return
          }
        }

        // Point feature selected from the category list.
        if (destination) {
          mapRef.current.flyTo(
            [destination.lat, destination.lng],
            DETAIL_ZOOM,
            { duration: 0.8 },
          )

          const placeName =
            selectedLandmark.name || 'Selected Place'

          const googleMapsUrl =
            `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`

          const popupContent = `
            <div style="font-family:system-ui,sans-serif;min-width:220px;line-height:1.5;color:#0f172a;">
              <div style="font-size:17px;font-weight:800;margin-bottom:10px;">
                ${placeName}
              </div>
              <a
                href="${googleMapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display:block;
                  width:100%;
                  box-sizing:border-box;
                  text-align:center;
                  text-decoration:none;
                  background:#009f91;
                  color:white;
                  padding:10px 12px;
                  border-radius:10px;
                  font-size:13px;
                  font-weight:700;
                "
              >
                Open in Google Maps
              </a>
            </div>
          `

          L.popup({
            maxWidth: 320,
            closeButton: true,
          })
            .setLatLng([destination.lat, destination.lng])
            .setContent(popupContent)

        }

        return
      }

      // Search -> Bus Stop: exact stop, slight zoom, immediate popup.
      if (selectedLandmark.sourceCategory === 'busStop' && destination) {
        mapRef.current.flyTo(
          [destination.lat, destination.lng],
          DETAIL_ZOOM,
          { duration: 0.9 }
        )

        if (selectedLandmark.fromSearch !== false) {
          const props = feature?.properties || {}

          const stopNo =
            props.No ?? props.no ??
            props.Number ?? props.number ??
            props.stop_no ?? props.stopNo ?? ''

          const stopName =
            props.Name ?? props.name ?? props.NAME ??
            props.stop_name ?? props.stopName ??
            selectedLandmark.name ?? 'Bus Stop'

          const cleanNo = String(stopNo ?? '').trim()
          const cleanName = String(stopName ?? '').trim()

          const popupContent = `
            <div style="font-family:system-ui,sans-serif;min-width:230px;line-height:1.5;color:#0f172a;">
              <div style="font-size:17px;font-weight:800;margin-bottom:9px;color:#1d4ed8;">Bus Stop</div>
              ${cleanNo ? `<div style="font-size:14px;margin-bottom:6px;"><strong>Stop No:</strong> ${cleanNo}</div>` : ''}
              <div style="font-size:14px;"><strong>Name:</strong><br/>${cleanName || 'Bus Stop'}</div>
            </div>
          `

          L.popup({ maxWidth: 320, closeButton: true })
            .setLatLng([destination.lat, destination.lng])
            .setContent(popupContent)


          setSelectedLandmark({ ...selectedLandmark, fromSearch: false })
        }

        return
      }

      // Search -> polygon: fit the actual feature and open popup.
      if (
        feature.geometry?.type === 'Polygon' ||
        feature.geometry?.type === 'MultiPolygon'
      ) {
        const layer = L.geoJSON(feature)
        const bounds = layer.getBounds()

        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            padding: [56, 56],
            maxZoom: DETAIL_ZOOM,
            animate: true,
          })

          // Building details are shown in the GIS status bar below the map.
          // Do not open a Leaflet popup here.
          if (selectedLandmark.fromSearch !== false) {
            setSelectedLandmark({
              ...selectedLandmark,
              fromSearch: false,
            })
          }

          return
        }
      }

      // Other point/landmark search.
      if (destination) {
        mapRef.current.flyTo(
          [destination.lat, destination.lng],
          DETAIL_ZOOM,
          { duration: 0.9 }
        )

        if (selectedLandmark.fromSearch !== false) {
          const popupContent = `
            <div style="font-family:system-ui,sans-serif;min-width:220px;line-height:1.5;color:#0f172a;">
              <div style="font-size:16px;font-weight:800;margin-bottom:7px;">${selectedLandmark.name || 'Location'}</div>
              <div style="font-size:13px;">${selectedLandmark.description || ''}</div>
            </div>
          `

          L.popup({ maxWidth: 300, closeButton: true })
            .setLatLng([destination.lat, destination.lng])
            .setContent(popupContent)


          setSelectedLandmark({ ...selectedLandmark, fromSearch: false })
        }
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

      const selected = {
        id:
          properties.id ??
          properties.ID ??
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
          `}</style>

          <LeafletMap
            ref={mapRef}
            center={[
              center.lat,
              center.lng,
            ]}
            zoom={16}
            scrollWheelZoom={
              isTouchDevice ? mapInteractionActive : true
            }
            dragging={
              isTouchDevice ? mapInteractionActive : true
            }
            touchZoom={
              isTouchDevice ? mapInteractionActive : true
            }
            doubleClickZoom={
              isTouchDevice ? mapInteractionActive : true
            }
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
              mapRef.current =
                map
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
    activeFeatureId={selectedLandmark?.id}
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

                16 official landmarks
               ================================================= */}

            {corporationLandmarks?.features?.length > 0 && (
              <GeoJsonLayer
                featureData={corporationLandmarks}
                layerKey="landmarks"
                showLabels={
                  selectedCategory === 'landmark' ||
                  selectedCategory === 'landmarks'
                }
                activeFeatureId={
                  selectedLandmark?.id
                }
                onFeatureClick={(feature) => {
                  clearRouting()

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

                  /*
                   * Google Maps URL.
                   */
                  const googleMapsUrl =
                    `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`

                  /*
                   * Popup.
                   */
                  const popupContent = `
                    <div
                      style="
                        font-family:system-ui,sans-serif;
                        min-width:240px;
                        line-height:1.5;
                        color:#0f172a;
                      "
                    >

                      <div
                        style="
                          font-size:17px;
                          font-weight:800;
                          margin-bottom:12px;
                        "
                      >
                        Corporation Landmark
                      </div>

                      <div
                        style="
                          font-size:14px;
                          margin-bottom:8px;
                        "
                      >
                        <strong>Landmark No:</strong>
                        ${landmarkNo}
                      </div>

                      <div
                        style="
                          font-size:14px;
                          margin-bottom:14px;
                        "
                      >
                        <strong>Name:</strong><br/>
                        ${landmarkName}
                      </div>

                      <a
                        href="${googleMapsUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                          display:block;
                          width:100%;
                          box-sizing:border-box;
                          text-align:center;
                          text-decoration:none;
                          background:#009f91;
                          color:white;
                          padding:11px 14px;
                          border-radius:12px;
                          font-size:14px;
                          font-weight:700;
                        "
                      >
                        Open in Google Maps
                      </a>

                    </div>
                  `

                  if (mapRef.current) {
                    L.popup({
                      maxWidth: 320,
                      closeButton: true,
                    })
                      .setLatLng([
                        destination.lat,
                        destination.lng,
                      ])
                      .setContent(
                        popupContent,
                      )

                  }

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
  activeFeatureId={selectedLandmark?.id}
  showLabels={selectedCategory === 'busStop'}
  onFeatureClick={handleBusStopClick}
/>
              )}

            {/* Landmark point markers are intentionally hidden. Building polygons are the clickable map features. */}

                        {/* =================================================
                 CATEGORY PLACE LOLLIPOP MARKERS
                ================================================= */}

            {selectedLandmark?.categoryPlaces?.length > 0 &&
              selectedLandmark?.sourceCategory !== 'building' &&
              selectedLandmark.categoryPlaces.map((place, index) => {
                const destination = getFeatureLatLng(place?.feature)

                if (!destination) return null

                const placeCategory =
                  place?.sourceCategory ||
                  selectedLandmark?.categoryId ||
                  'category'

                return (
                  <Marker
                    key={`category-place-${index}-${place.name}`}
                    position={[
                      destination.lat,
                      destination.lng,
                    ]}
                    icon={createLollipopIcon(placeCategory)}
                  >
                  </Marker>
                )
              })}

{/* =================================================
                SELECTED LOCATION MARKER
               ================================================= */}

            {(selectedLandmark?.sourceCategory === 'building' ||
              selectedLandmark?.sourceCategory === 'corporationLandmark') &&
              selectedLandmark?.latitude != null &&
              selectedLandmark?.longitude != null && (
                <Marker
                  position={[
                    selectedLandmark.latitude,
                    selectedLandmark.longitude,
                  ]}
                  icon={createRedLollipopIcon()}
                  zIndexOffset={2000}
                >
                </Marker>
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

    </>
  )
}