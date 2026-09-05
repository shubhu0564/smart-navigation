import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigation } from './useNavigation'
import { searchLandmarks } from '../utils/searchUtils'
import { getCategoryLabel } from '../utils/helpers'
import { filterGeoJsonBySite } from '../utils/geoJsonUtils'
import { deriveFeatureCategory } from '../utils/geoJsonUtils'

export function useSearch() {
  const { landmarks, selectedCategory, setSelectedLandmark, setSearchQuery, setToast, geoJson } = useNavigation()
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [history, setHistory] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('gulmohar-search-history')
      if (saved) setHistory(JSON.parse(saved))
    } catch {
      // ignore storage errors
    }
  }, [])

  const recentSearches = useMemo(() => history.slice(0, 6), [history])

  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions(recentSearches)
      setActiveIndex(-1)
      return
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      // Build a combined search pool: normalized landmarks + buildings + bus stops
      const pool = []

      // include normalized landmarks (already formatted)
      const landmarkPool = selectedCategory && selectedCategory !== 'all'
        ? landmarks.filter((landmark) => landmark.category === selectedCategory)
        : landmarks
      const filteredLandmarkPool = selectedCategory === 'educationalInstitute'
        ? landmarkPool.filter((landmark) => ['yes', 'true', '1'].includes(
            String(landmark?.feature?.properties?.Edu_Bldg ?? '').trim().toLowerCase(),
          ))
        : landmarkPool
      pool.push(...filteredLandmarkPool)

      // NOTE: intentionally not including legacy `buildings.geojson` here.
      // Search pool intentionally restricted to derived landmarks, client_buildings, and bus stops.

      // include client buildings with distinct id prefix
      // client buildings: use geometry but do not trust landmarks.geojson for placement
      const clientFeatures = (geoJson.siteBoundary && geoJson.clientBuildings) ? (filterGeoJsonBySite(geoJson.clientBuildings, geoJson.siteBoundary).features || []) : (geoJson.clientBuildings?.features || [])
      clientFeatures.forEach((feature, idx) => {
        const props = feature?.properties || {}
        const isEducationalBuilding = ['yes', 'true', '1'].includes(
          String(props.Edu_Bldg ?? '').trim().toLowerCase(),
        )

        if (
          selectedCategory === 'educationalInstitute' &&
          !isEducationalBuilding
        ) {
          return
        }
        const rawName = props.bldg_namee ?? null
        const rawBno = props.bldg_no ?? (props.fid_1 ?? null)
        const rawDisplayName = rawName && String(rawName).trim() !== ''
          ? String(rawName).trim()
          : 'Unnamed Building'
        const displayName = /kamla\s+rheja\s+vidyanidhi/i.test(rawDisplayName)
          ? 'Kamla Raheja Vidyanidhi institute for architecture and environmental studies'
          : rawDisplayName
        const displayBno = rawBno !== null && rawBno !== undefined && String(rawBno).trim() !== '' ? String(rawBno) : 'Not assigned'
        const name = `${displayName} — Building No: ${displayBno}`
        const bno = rawBno

        // find a safe coordinate to show in the suggestion (centroid of polygon preferred)
        let lat = null
        let lng = null
        try {
          const coords = feature.geometry?.coordinates || []
          const first = (function findFirst(coordsArr) {
            if (!Array.isArray(coordsArr)) return null
            for (const c of coordsArr) {
              if (typeof c[0] === 'number' && typeof c[1] === 'number') return c
              const nested = findFirst(c)
              if (nested) return nested
            }
            return null
          })(coords)
          if (first) { lng = first[0]; lat = first[1] }
        } catch (e) {}

        const idVal = props.fid_1 ?? props.bldg_no ?? idx
        // derive category id from the client building properties
        const categoryId = isEducationalBuilding
          ? 'educationalInstitute'
          : deriveFeatureCategory(feature, 'clientBuildings')
        const item = {
          id: `client-building-${idVal}-${idx}`,
          // display full label in the name so suggestions show name + building no
          name,
          // expose raw values for popup construction
          bldg_namee: rawName,
          bldg_no: rawBno,
          road: '',
          category: categoryId,
          categoryLabel: getCategoryLabel(categoryId, 'en'),
          sourceCategory: isEducationalBuilding
            ? 'educationalInstitute'
            : 'building',
          // keep numeric bno as description so searching numbers matches
          description: rawBno !== null && rawBno !== undefined ? String(rawBno) : 'Not assigned',
          latitude: lat,
          longitude: lng,
          feature,
        }
        // Always include client buildings in the search pool (search across all buildings)
        pool.push(item)
      })

      // include bus stops
      const busFeatures = geoJson.busStops?.features || []
      busFeatures.forEach((feature, idx) => {
        const props = feature?.properties || {}
        const coords = feature.geometry?.coordinates || []
        const lng = coords[0]; const lat = coords[1]
        const name = props.Name || props.name || ''
        const item = {
          id: `bus-${props.id ?? idx}`,
          name: name,
          road: '',
          category: 'busStop',
          categoryLabel: getCategoryLabel('busStop', 'en'),
          sourceCategory: 'busStop',
          description: '',
          latitude: lat,
          longitude: lng,
          feature,
        }
        if (!selectedCategory || selectedCategory === 'all' || selectedCategory === item.category) {
          pool.push(item)
        }
      })

      const matches = searchLandmarks(inputValue, pool)
      setSuggestions(matches.slice(0, 8))
      setActiveIndex(-1)
    }, 220)

    return () => window.clearTimeout(debounceRef.current)
  }, [inputValue, landmarks, recentSearches, selectedCategory])

  const saveToHistory = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const nextHistory = [trimmed, ...history.filter((item) => item !== trimmed)].slice(0, 8)
    setHistory(nextHistory)
    window.localStorage.setItem('gulmohar-search-history', JSON.stringify(nextHistory))
  }

  const removeFromHistory = (value) => {
    const trimmed = String(value ?? '').trim()
    if (!trimmed) return

    const nextHistory = history.filter((item) => item !== trimmed)
    setHistory(nextHistory)
    window.localStorage.setItem('gulmohar-search-history', JSON.stringify(nextHistory))
  }

  const selectSuggestion = (item) => {
    // Normalize selection into the shape expected by MapContainer
    const isLandmarkFeature =
      item?.feature?.geometry?.type === 'Polygon' ||
      item?.feature?.geometry?.type === 'MultiPolygon'
    const isCorporationLandmark =
      item?.category === 'landmark' ||
      item?.sourceCategory === 'corporationLandmark' ||
      item?.sourceCategory === 'clientBuildings'
    const base = {
      id: item.id,
      name: /kamla\s+rheja\s+vidyanidhi/i.test(String(item.name ?? ''))
        ? 'Kamla Raheja Vidyanidhi institute for architecture and environmental studies'
        : item.name ?? item.title ?? 'Unknown',
      road: item.road ?? '',
      category: item.category ?? item.sourceCategory ?? 'landmark',
      description: item.description ?? '',
    }

    const mapSection = document.getElementById('landmark-map-section')
    mapSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    // Let the smooth scroll bring the map into view before selection triggers
    // the existing exact-feature zoom and highlight effect.
    window.setTimeout(() => {
      if (
        item.sourceCategory === 'building' ||
        item.sourceCategory === 'educationalInstitute'
      ) {
        // Use the original GeoJSON feature and mark selection as coming from search
        setSelectedLandmark({
          ...base,
          sourceCategory: item.sourceCategory,
          latitude: item.latitude,
          longitude: item.longitude,
          feature: item.feature,
          bldg_namee: item.bldg_namee ?? null,
          bldg_no: item.bldg_no ?? null,
          fromSearch: true,
        })
      } else if (item.sourceCategory === 'busStop') {
        setSelectedLandmark({
          ...base,
          sourceCategory: 'busStop',
          latitude: item.latitude,
          longitude: item.longitude,
          feature: item.feature,
        })
      } else {
        setSelectedLandmark({
          ...item,
          ...base,
          sourceCategory: isCorporationLandmark && isLandmarkFeature
            ? 'corporationLandmark'
            : item.sourceCategory,
          fromSearch: true,
          feature: item.feature,
        })
      }
    }, 500)

    setSearchQuery(item.name)
    setInputValue(item.name)
    setShowSuggestions(false)
    removeFromHistory(item.name)
    setToast({ en: `Focused on ${item.name}`, mr: `${item.name}कडे केंद्रित केले` })
  }

  const clearInput = () => {
    setInputValue('')
    setSearchQuery('')
    setSuggestions(recentSearches)
    setShowSuggestions(true)
  }

  const clearHistory = () => {
    setHistory([])
    window.localStorage.removeItem('gulmohar-search-history')
  }

  const handleKeyDown = (event) => {
    if (!showSuggestions && event.key === 'ArrowDown') {
      setShowSuggestions(true)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % Math.max(suggestions.length, 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex])
      }
    } else if (event.key === 'Escape') {
      setShowSuggestions(false)
      setActiveIndex(-1)
    }
  }

  const handleInputChange = (value) => {
    setInputValue(value)
    setSearchQuery(value)
  }

  return {
    inputValue,
    setInputValue: handleInputChange,
    suggestions,
    activeIndex,
    setActiveIndex,
    showSuggestions,
    setShowSuggestions,
    recentSearches,
    selectSuggestion,
    clearInput,
    clearHistory,
    handleKeyDown,
    saveToHistory,
  }
}
