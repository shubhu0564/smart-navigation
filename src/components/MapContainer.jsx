import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapContainer as LeafletMap, TileLayer, Marker, Circle, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { LoaderCircle, MapPin, Route, Clock3 } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { useLiveLocation } from '../hooks/useLiveLocation'
import { getText } from '../utils/helpers'
import FloatingActionBar from './FloatingActionBar'
import GeoJsonLayer from './GeoJsonLayer'
import LandmarkPopup from './LandmarkPopup'
import { filterLandmarksGeoJson } from '../utils/geoJsonUtils'

export default function MapContainer() {
  const mapRef = useRef(null)
  const mapWrapperRef = useRef(null)
  const routingControlRef = useRef(null)
  const { language, selectedLandmark, setSelectedLandmark, selectedCategory, searchQuery, setToast, enabledCategories, setRouteInfo, geoJson, loading, error } = useNavigation()
  const { position, accuracy, speed } = useLiveLocation()
  const [route, setRoute] = useState(null)
  const [routeSummary, setRouteSummary] = useState(null)
  const [routeDetails, setRouteDetails] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  const visibleLandmarks = useMemo(
    () => filterLandmarksGeoJson(geoJson.landmarks, selectedCategory, searchQuery, enabledCategories),
    [geoJson.landmarks, selectedCategory, searchQuery, enabledCategories],
  )

  useEffect(() => {
    if (!geoJson.siteBoundary || !mapRef.current) return
    if (selectedCategory !== 'all') return
    try {
      const boundaryLayer = L.geoJSON(geoJson.siteBoundary)
      const bounds = boundaryLayer.getBounds()
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [30, 30] })
      }
    } catch (error) {
      console.error('Failed to fitBounds from site boundary', error)
    }
  }, [geoJson.siteBoundary, selectedCategory])

  useEffect(() => {
    if (!visibleLandmarks?.features?.length || !mapRef.current) return
    if (selectedCategory === 'all') return
    try {
      const landmarksLayer = L.geoJSON(visibleLandmarks)
      const bounds = landmarksLayer.getBounds()
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [30, 30] })
      }
    } catch (error) {
      console.error('Failed to fit bounds for selected category', error)
    }
  }, [visibleLandmarks, selectedCategory])

  useEffect(() => {
    if (!selectedLandmark || !mapRef.current) return
    mapRef.current.flyTo([selectedLandmark.latitude, selectedLandmark.longitude], 18.5, { duration: 1.2 })
  }, [selectedLandmark])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isTouchDevice) return

    map.dragging.disable()
    map.touchZoom.disable()

    const container = map.getContainer()

    const enableTwoFingerInteraction = (event) => {
      if (event.touches?.length >= 2) {
        map.dragging.enable()
        map.touchZoom.enable()
      }
    }

    const disableSingleFingerInteraction = (event) => {
      if (event.touches?.length < 2) {
        map.dragging.disable()
        map.touchZoom.disable()
      }
    }

    container.addEventListener('touchstart', enableTwoFingerInteraction, true)
    container.addEventListener('touchmove', enableTwoFingerInteraction, true)
    container.addEventListener('touchend', disableSingleFingerInteraction, true)
    container.addEventListener('touchcancel', disableSingleFingerInteraction, true)

    return () => {
      container.removeEventListener('touchstart', enableTwoFingerInteraction, true)
      container.removeEventListener('touchmove', enableTwoFingerInteraction, true)
      container.removeEventListener('touchend', disableSingleFingerInteraction, true)
      container.removeEventListener('touchcancel', disableSingleFingerInteraction, true)
    }
  }, [isTouchDevice])

  useEffect(() => {
    if (!position || !selectedLandmark || !mapRef.current) return
    const map = mapRef.current
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(position.lat, position.lng), L.latLng(selectedLandmark.latitude, selectedLandmark.longitude)],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#0f766e', weight: 5, opacity: 0.85 }],
      },
      createMarker: () => null,
    })

    routingControl.on('routesfound', (event) => {
      const routeResult = event.routes[0]
      const summary = routeResult.summary
      const walkingDistance = (summary.totalDistance / 1000).toFixed(1)
      const walkingTime = Math.max(3, Math.round(summary.totalTime / 60))
      const cyclingTime = Math.max(4, Math.round(walkingTime * 0.7))
      const drivingTime = Math.max(4, Math.round(walkingTime / 2))
      const arrivalTime = new Date(Date.now() + walkingTime * 60000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      setRoute(routeResult.coordinates.map((coord) => [coord.lat, coord.lng]))
      setRouteSummary({ distance: walkingDistance, time: walkingTime })
      setRouteDetails({
        walkingDistance,
        walkingTime,
        drivingTime,
        cyclingTime,
        nextTurn: `Follow ${selectedLandmark.road}`,
        arrivalTime,
        currentSpeed: speed ? `${Math.round(speed * 3.6)} km/h` : '—',
      })
      setRouteInfo({
        distance: `${walkingDistance} km`,
        travelTime: `${walkingTime} min`,
        remainingDistance: `${walkingDistance} km`,
        cyclingTime: `${cyclingTime} min`,
        drivingTime: `${drivingTime} min`,
        nextTurn: `Follow ${selectedLandmark.road}`,
        arrivalTime,
        currentSpeed: speed ? `${Math.round(speed * 3.6)} km/h` : '—',
      })
    })

    routingControl.addTo(map)
    routingControlRef.current = routingControl

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
      setRoute(null)
      setRouteSummary(null)
      setRouteDetails(null)
      setRouteInfo(null)
    }
  }, [position, selectedLandmark, setRouteInfo, speed])

  const center = position ?? { lat: 19.105, lng: 72.824 }

  const focusOnCurrentLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const nextPosition = { lat: location.coords.latitude, lng: location.coords.longitude }
        mapRef.current.flyTo([nextPosition.lat, nextPosition.lng], 16.5, { duration: 1.2 })
        setToast({ en: 'Centered on your location', mr: 'तुमच्या स्थानावर केंद्रित केले' })
      },
      () => {
        setToast({ en: 'Location access was denied', mr: 'स्थान प्रवेश नाकारला' })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    )
  }

  const focusOnSelected = () => {
    if (!mapRef.current || !selectedLandmark) return
    mapRef.current.flyTo([selectedLandmark.latitude, selectedLandmark.longitude], 18.5, { duration: 1.2 })
    setToast({ en: `Centered on ${selectedLandmark.name}`, mr: `${selectedLandmark.name}कडे केंद्रित केले` })
  }

  const openGoogleMaps = () => {
    if (!selectedLandmark) return
    const origin = position ? `${position.lat},${position.lng}` : ''
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${selectedLandmark.latitude},${selectedLandmark.longitude}&travelmode=walking`
      : `https://www.google.com/maps/search/?api=1&query=${selectedLandmark.latitude},${selectedLandmark.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const toggleFullscreen = async () => {
    if (!mapWrapperRef.current) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      setIsFullscreen(false)
      return
    }
    await mapWrapperRef.current.requestFullscreen()
    setIsFullscreen(true)
  }

  const resetView = () => {
    if (!mapRef.current) return
    const target = selectedLandmark ? [selectedLandmark.latitude, selectedLandmark.longitude] : [center.lat, center.lng]
    mapRef.current.flyTo(target, 16, { duration: 1.2 })
  }

  const shareLocation = async () => {
    if (!selectedLandmark) return
    const url = `https://www.google.com/maps/search/?api=1&query=${selectedLandmark.latitude},${selectedLandmark.longitude}`
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedLandmark.name, text: `${selectedLandmark.name} • ${selectedLandmark.road}`, url })
      } catch {
        // ignore
      }
      return
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setToast({ en: 'Location link copied', mr: 'स्थान लिंक कॉपी केले' })
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-teal-600">{getText({ en: 'GIS MAP', mr: 'GIS नकाशा' }, language)}</p>
        </div>
      </div>

      <div ref={mapWrapperRef} className="relative h-[460px] w-full bg-slate-100" style={{ touchAction: isTouchDevice ? 'pan-y pinch-zoom' : 'auto' }}>
        {loading && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-slate-50/80 px-4 text-center">
            <LoaderCircle className="animate-spin text-teal-600" size={24} />
            <p className="text-sm text-slate-600">{getText({ en: 'Loading map data...', mr: 'नकाशा डेटा लोड करत आहे...' }, language)}</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-50/90 px-4 text-center text-sm text-slate-600">
            {error}
          </div>
        )}

        <LeafletMap ref={mapRef} center={[center.lat, center.lng]} zoom={16} scrollWheelZoom={!isTouchDevice} dragging={!isTouchDevice} touchZoom={!isTouchDevice} doubleClickZoom={!isTouchDevice} className="h-full w-full" whenCreated={(map) => { mapRef.current = map }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
          />

          {geoJson.openSpaces && <GeoJsonLayer featureData={geoJson.openSpaces} layerKey="openSpaces" />}
          {geoJson.buildings && <GeoJsonLayer featureData={geoJson.buildings} layerKey="buildings" />}
          {geoJson.roads && <GeoJsonLayer featureData={geoJson.roads} layerKey="roads" />}
          {geoJson.siteBoundary && <GeoJsonLayer featureData={geoJson.siteBoundary} layerKey="siteBoundary" />}
          {visibleLandmarks && (
            <GeoJsonLayer
              featureData={visibleLandmarks}
              layerKey="landmarks"
              activeFeatureId={selectedLandmark?.id}
              onFeatureClick={(feature) => {
                const properties = feature?.properties || {}
                const selected = {
                  id: properties.id ?? `${feature?.geometry?.coordinates?.[1]}-${feature?.geometry?.coordinates?.[0]}`,
                  name: properties.name ?? 'Unknown place',
                  road: properties.road ?? properties.address ?? '',
                  category: properties.category ?? 'Unknown',
                  latitude: feature.geometry.coordinates[1],
                  longitude: feature.geometry.coordinates[0],
                  description: properties.description ?? properties.name ?? '',
                  image: properties.image ?? null,
                  address: properties.address ?? properties.road ?? '',
                  rating: properties.rating ?? 4.6,
                  steps: properties.steps ?? [],
                }
                setSelectedLandmark(selected)
                setToast({ en: `Focused on ${selected.name}`, mr: `${selected.name}कडे केंद्रित केले` })
              }}
            />
          )}

          {position && (
            <>
              <Circle center={[position.lat, position.lng]} pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.18 }} radius={Math.max(accuracy ?? 25, 30)} />
              <Marker position={[position.lat, position.lng]} icon={L.divIcon({ className: 'pulse-marker', html: '<div class="pulse-core"></div>', iconSize: [20, 20], iconAnchor: [10, 10] })} />
            </>
          )}

          {route && <Polyline positions={route} pathOptions={{ color: '#0f766e', weight: 5, opacity: 0.9 }} />}
        </LeafletMap>
        <FloatingActionBar onLocate={focusOnCurrentLocation} onNavigate={focusOnSelected} onReset={resetView} onGoogleMaps={openGoogleMaps} onFullscreen={toggleFullscreen} onLiveGps={focusOnCurrentLocation} />
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
        <span className="flex items-center gap-2"><MapPin size={14} /> {getText({ en: 'Live GPS tracking', mr: 'थेट GPS ट्रॅकिंग' }, language)}</span>
        <span className="flex items-center gap-3">
          {routeDetails ? (
            <>
              <span className="flex items-center gap-1"><Route size={14} /> {routeDetails.walkingDistance} km</span>
              <span className="flex items-center gap-1"><Clock3 size={14} /> {routeDetails.walkingTime} min walk</span>
            </>
          ) : (
            getText({ en: 'Tap a landmark to route', mr: 'मार्गासाठी लँडमार्क निवडा' }, language)
          )}
        </span>
      </div>
    </motion.div>
      {selectedLandmark && (
        <LandmarkPopup
          landmark={selectedLandmark}
          onNavigate={() => {
            if (position) {
              setToast({ en: 'Starting navigation...', mr: 'मार्गदर्शन सुरू होते आहे...' })
            }
            focusOnSelected()
          }}
          onViewMap={focusOnSelected}
          onClose={() => setSelectedLandmark(null)}
        />
      )}
    </>
  )
}
