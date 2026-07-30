import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle, Polyline, ImageOverlay } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { LoaderCircle, MapPin, Route, Clock3 } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { useLiveLocation } from '../hooks/useLiveLocation'
import { getText } from '../utils/helpers'
import { landmarks, roadLabels } from '../data/landmarks'
import overlayImage from '../assets/gis-overlay.svg'
import FloatingActionBar from './FloatingActionBar'

const categoryColors = {
  Park: '#0f766e',
  School: '#2563eb',
  Government: '#7c3aed',
  Community: '#ea580c',
  Temple: '#b45309',
  Institute: '#0ea5e9',
  Club: '#f59e0b',
  'Bus Stop': '#64748b',
  'Public Toilet': '#ef4444',
}

const createIcon = (color, label, active = false) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color}; color:white; border:2px solid white; border-radius:999px; width:${active ? 34 : 28}px; height:${active ? 34 : 28}px; display:flex; align-items:center; justify-content:center; font-size:${active ? 12 : 11}px; font-weight:700; box-shadow:0 6px 18px rgba(15,23,42,0.18);">${label}</div>`,
    iconSize: [active ? 34 : 28, active ? 34 : 28],
    iconAnchor: [active ? 17 : 14, active ? 17 : 14],
  })

export default function MapContainer() {
  const mapRef = useRef(null)
  const mapWrapperRef = useRef(null)
  const routingControlRef = useRef(null)
  const popupRef = useRef(null)
  const markerRefs = useRef({})
  const { language, selectedLandmark, setSelectedLandmark, selectedCategory, searchQuery, setToast, enabledCategories, setRouteInfo } = useNavigation()
  const { position, accuracy, speed, loading, error } = useLiveLocation()
  const [route, setRoute] = useState(null)
  const [routeSummary, setRouteSummary] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [routeDetails, setRouteDetails] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const visibleLandmarks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return landmarks.filter((landmark) => {
      const categoryMatch = selectedCategory === 'all' || landmark.category === selectedCategory
      const enabledMatch = enabledCategories.includes(landmark.category)
      const searchMatch = !query || [landmark.name, landmark.road, landmark.category, landmark.id.toString()].some((value) => value.toLowerCase().includes(query))
      return categoryMatch && enabledMatch && searchMatch
    })
  }, [searchQuery, selectedCategory, enabledCategories])

  useEffect(() => {
    if (!mapRef.current) return
    const bounds = [[19.101, 72.819], [19.111, 72.829]]
    mapRef.current.fitBounds(bounds, { padding: [30, 30] })
    setMapReady(true)
  }, [])

  useEffect(() => {
    if (!selectedLandmark || !mapRef.current) return
    const map = mapRef.current
    map.flyTo([selectedLandmark.latitude, selectedLandmark.longitude], 18.5, { duration: 1.2 })
    const marker = markerRefs.current[selectedLandmark.id]
    if (marker) {
      window.setTimeout(() => marker.openPopup?.(), 220)
    }
  }, [selectedLandmark])

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
      const route = event.routes[0]
      const summary = route.summary
      const walkingDistance = (summary.totalDistance / 1000).toFixed(1)
      const walkingTime = Math.max(3, Math.round(summary.totalTime / 60))
      const cyclingTime = Math.max(4, Math.round(walkingTime * 0.7))
      const drivingTime = Math.max(4, Math.round(walkingTime / 2))
      const arrivalTime = new Date(Date.now() + walkingTime * 60000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      setRoute(route.coordinates.map((coord) => [coord.lat, coord.lng]))
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
  }, [position, selectedLandmark])

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-teal-600">{getText({ en: 'Live GIS map', mr: 'थेट GIS नकाशा' }, language)}</p>
          <p className="text-sm text-slate-500">{getText({ en: 'OpenStreetMap • live GPS • walking routes', mr: 'OpenStreetMap • थेट GPS • पादचारी मार्ग' }, language)}</p>
        </div>
      </div>

      <div ref={mapWrapperRef} className="relative h-[460px] w-full bg-slate-100">
        {!mapReady && !loading && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-slate-50/90 px-4 text-center">
            <MapPin className="text-teal-600" size={24} />
            <p className="text-sm text-slate-600">{getText({ en: 'Preparing your live GIS view…', mr: 'तुमचा थेट GIS दृष्य तयार होत आहे…' }, language)}</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-slate-50/90 px-4 text-center">
            <LoaderCircle className="animate-spin text-teal-600" size={24} />
            <p className="text-sm text-slate-600">{getText({ en: 'Locating you…', mr: 'तुमचे स्थान शोधत आहे…' }, language)}</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-50/90 px-4 text-center text-sm text-slate-600">
            {error}
          </div>
        )}

        <LeafletMap ref={mapRef} center={[center.lat, center.lng]} zoom={16} scrollWheelZoom className="h-full w-full" whenCreated={(map) => { mapRef.current = map }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
          <ImageOverlay url={overlayImage} bounds={[[19.111, 72.819], [19.101, 72.829]]} opacity={0.4} />

          {position && (
            <>
              <Circle center={[position.lat, position.lng]} pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.18 }} radius={Math.max(accuracy ?? 25, 30)} />
              <Marker position={[position.lat, position.lng]} icon={L.divIcon({ className: 'pulse-marker', html: '<div class="pulse-core"></div>', iconSize: [20, 20], iconAnchor: [10, 10] })} />
            </>
          )}

          {visibleLandmarks.map((landmark) => (
            <Marker
              key={landmark.id}
              ref={(instance) => {
                if (instance) {
                  markerRefs.current[landmark.id] = instance
                }
              }}
              position={[landmark.latitude, landmark.longitude]}
              icon={createIcon(categoryColors[landmark.category] ?? '#0f766e', landmark.id.toString(), selectedLandmark?.id === landmark.id)}
              eventHandlers={{
                click: () => {
                  setSelectedLandmark(landmark)
                  setToast({ en: `Focused on ${landmark.name}`, mr: `${landmark.name}कडे केंद्रित केले` })
                  if (popupRef.current) {
                    popupRef.current = null
                  }
                },
              }}
            >
              <Popup ref={popupRef}>
                <div className="min-w-[220px] space-y-2 text-sm text-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{landmark.id}. {landmark.name}</p>
                      <p className="text-xs text-slate-500">{landmark.road}</p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700">{landmark.category}</span>
                  </div>
                  <p className="text-xs text-slate-600">{landmark.description}</p>
                  <img src={landmark.image} alt={landmark.name} className="h-24 w-full rounded-xl object-cover" />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedLandmark(landmark)} className="rounded-full bg-teal-600 px-3 py-2 text-xs font-semibold text-white">Navigate</button>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${landmark.latitude},${landmark.longitude}`} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">Open in Google Maps</a>
                    <button type="button" onClick={shareLocation} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">Share</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {route && <Polyline positions={route} pathOptions={{ color: '#0f766e', weight: 5, opacity: 0.9 }} />}

          {roadLabels.map((label) => (
            <Marker key={label} position={[19.105, 72.824]} icon={L.divIcon({ className: 'road-label', html: `<div class="road-label-chip">${label}</div>`, iconSize: [120, 24], iconAnchor: [60, 12] })} />
          ))}
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
  )
}
