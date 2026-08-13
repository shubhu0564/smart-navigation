import { useEffect, useMemo, useState } from 'react'
import { NavigationContext } from './NavigationContext.js'
import { useGeoJsonData } from '../hooks/useGeoJsonData'
import { getLandmarkCategoryId, normalizeLandmarks, filterGeoJsonBySite, extractLandmarksFromClientBuildings } from '../utils/geoJsonUtils'

const categoryMeta = {
  all: { label: { en: 'Landmark', mr: 'लँडमार्क' }, icon: 'Landmark' },
  education: { label: { en: 'Educational Institute', mr: 'शैक्षणिक संस्था' }, icon: 'School' },
  busStop: { label: { en: 'Bus Stop', mr: 'बस थांबा' }, icon: 'Bus' },
  government: { label: { en: 'Government Building', mr: 'सरकारी इमारत' }, icon: 'Building2' },
  park: { label: { en: 'Park / Playground', mr: 'उद्यान / मैदान' }, icon: 'Tree' },
  community: { label: { en: 'Community Center', mr: 'समुदाय केंद्र' }, icon: 'Users' },
}

const categoryOrder = [
  'all',
  'education',
  'busStop',
  'government',
  'park',
  'community',
]

const desiredCategories = categoryOrder.filter((id) => id !== 'all')

export function NavigationProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [darkMode, setDarkMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [enabledCategories, setEnabledCategories] = useState(() => desiredCategories)
  const [selectedLandmark, setSelectedLandmark] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState({ lat: 19.105, lng: 72.824 })
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const { geoJson, loading, error } = useGeoJsonData()
  // Derive landmarks from client buildings so placement uses building geometry centroid
  const landmarks = useMemo(() => {
    // prefer clientBuildings as source of truth for landmark placement
    const client = geoJson.clientBuildings || { type: 'FeatureCollection', features: [] }
    const derived = extractLandmarksFromClientBuildings(client)
    return normalizeLandmarks(derived, { lat: 19.112, lng: 72.836 })
  }, [geoJson.clientBuildings])

  const categoryCounts = useMemo(() => {
    const counts = { all: 0 }
    // count derived landmarks (from client buildings)
    const derived = extractLandmarksFromClientBuildings(geoJson.clientBuildings || { type: 'FeatureCollection', features: [] })
    const features = (geoJson.siteBoundary && derived) ? (filterGeoJsonBySite(derived, geoJson.siteBoundary).features || []) : (derived?.features ?? [])
    counts.all = features.length
    features.forEach((feature) => {
      const category = getLandmarkCategoryId(feature?.properties?.derivedCategory || feature?.properties?.category)
      // only include visible categories in counts; treat uncategorized separately (not exposed)
      counts[category] = (counts[category] ?? 0) + 1
    })
    const busStopFeatures = geoJson.busStops?.features ?? []
    counts['busStop'] = (counts['busStop'] ?? 0) + busStopFeatures.length
    return counts
  }, [geoJson.landmarks, geoJson.busStops])

  const categories = useMemo(() => {
    const ordered = ['all', ...desiredCategories]

    return ordered.map((id) => {
      const meta = categoryMeta[id] || { label: { en: id, mr: id }, icon: 'MapPin' }
      return { id, label: meta.label, icon: meta.icon, count: categoryCounts[id] ?? 0 }
    })
  }, [geoJson.landmarks, categoryCounts])

  // Keep selection empty until the user clicks a landmark or chooses one from search.

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      darkMode,
      setDarkMode,
      selectedCategory,
      setSelectedCategory,
      enabledCategories,
      setEnabledCategories,
      selectedLandmark,
      setSelectedLandmark,
      searchQuery,
      setSearchQuery,
      userLocation,
      setUserLocation,
      menuOpen,
      setMenuOpen,
      toast,
      setToast,
      routeInfo,
      setRouteInfo,
      landmarks,
      categories,
      geoJson,
      loading,
      error,
    }),
    [language, darkMode, selectedCategory, enabledCategories, selectedLandmark, searchQuery, userLocation, menuOpen, toast, routeInfo, landmarks, geoJson, loading, error],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

