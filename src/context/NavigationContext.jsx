import { useMemo, useState, useEffect } from 'react'
import { landmarks } from '../data/landmarks'
import { NavigationContext } from './NavigationContext.js'

export function NavigationProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [darkMode, setDarkMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [enabledCategories, setEnabledCategories] = useState(() => Array.from(new Set(landmarks.map((landmark) => landmark.category))))
  const [selectedLandmark, setSelectedLandmark] = useState(landmarks[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState({ lat: 19.105, lng: 72.824 })
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)

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
    }),
    [language, darkMode, selectedCategory, enabledCategories, selectedLandmark, searchQuery, userLocation, menuOpen, toast, routeInfo],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

