import { useEffect, useMemo, useState } from 'react'
import { NavigationContext } from './NavigationContext.js'
import { useGeoJsonData } from '../hooks/useGeoJsonData'
import { getLandmarkCategoryId, normalizeLandmarks } from '../utils/geoJsonUtils'

const categoryMeta = {
  all: { label: { en: 'Landmark', mr: 'लँडमार्क' }, icon: 'Landmark' },
  park: { label: { en: 'Park / Playground', mr: 'उद्यान / खेळाचे मैदान' }, icon: 'Trees' },
  education: { label: { en: 'Educational Institute', mr: 'शैक्षणिक संस्था' }, icon: 'School' },
  busStop: { label: { en: 'Bus Stop', mr: 'बस थांबा' }, icon: 'Bus' },
  government: { label: { en: 'Government Building', mr: 'सरकारी इमारत' }, icon: 'Building2' },
}

const categoryOrder = [
  'all',
  'park',
  'education',
  'busStop',
  'government',
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
  const landmarks = useMemo(() => normalizeLandmarks(geoJson.landmarks), [geoJson.landmarks])

  const categoryCounts = useMemo(() => {
    const counts = { all: 0 }
    const features = geoJson.landmarks?.features ?? []
    counts.all = features.length
    features.forEach((feature) => {
      const category = getLandmarkCategoryId(feature?.properties?.category)
      counts[category] = (counts[category] ?? 0) + 1
    })
    return counts
  }, [geoJson.landmarks])

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

