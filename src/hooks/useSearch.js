import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigation } from './useNavigation'
import { searchLandmarks } from '../utils/searchUtils'

export function useSearch() {
  const { landmarks, selectedCategory, setSelectedLandmark, setSearchQuery, setToast } = useNavigation()
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
      const filteredLandmarks = selectedCategory && selectedCategory !== 'all' ? landmarks.filter((landmark) => landmark.category === selectedCategory) : landmarks
      const matches = searchLandmarks(inputValue, filteredLandmarks)
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

  const selectSuggestion = (item) => {
    setSelectedLandmark(item)
    setSearchQuery(item.name)
    setInputValue(item.name)
    setShowSuggestions(false)
    saveToHistory(item.name)
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
