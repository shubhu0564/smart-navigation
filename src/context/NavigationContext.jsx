import { useEffect, useMemo, useState } from 'react'
import { NavigationContext } from './NavigationContext.js'
import { useGeoJsonData } from '../hooks/useGeoJsonData'
import { normalizeLandmarks } from '../utils/geoJsonUtils'
import { categories as fallbackCategories } from '../data/landmarks'

const categoryMeta = {
  all: { label: { en: 'All Places', mr: 'सर्व स्थळे' }, icon: 'Compass' },
  'Hospitals / Medical': { label: { en: 'Hospitals / Medical', mr: 'रुग्णालये / वैद्यकीय' }, icon: 'HeartPulse' },
  Park: { label: { en: 'Parks', mr: 'बागा' }, icon: 'Trees' },
  Institute: { label: { en: 'Educational Institutes', mr: 'शैक्षणिक संस्था' }, icon: 'Building2' },
  Community: { label: { en: 'Community Centres', mr: 'समुदाय केंद्रे' }, icon: 'Landmark' },
  'Bus Stop': { label: { en: 'Bus Stops', mr: 'बस थांबे' }, icon: 'Bus' },
  'Public Toilet': { label: { en: 'Public Toilets', mr: 'सार्वजनिक शौचालये' }, icon: 'Toilet' },
  Temple: { label: { en: 'Temples', mr: 'मंदिर' }, icon: 'Church' },
  Government: { label: { en: 'Government Buildings', mr: 'सरकारी इमारती' }, icon: 'Building2' },
  School: { label: { en: 'Schools', mr: 'शाळा' }, icon: 'School' },
  'Research Institute': { label: { en: 'Research Institutes', mr: 'संशोधन संस्था' }, icon: 'Building2' },
  Club: { label: { en: 'Clubs', mr: 'क्लब' }, icon: 'Users' },
}

const categoryOrder = [
  'all',
  'Hospitals / Medical',
  'Park',
  'Institute',
  'Community',
  'Bus Stop',
  'Public Toilet',
  'Temple',
  'Government',
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
      const category = feature?.properties?.category || 'Unknown'
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

