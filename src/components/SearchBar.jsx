import { Search, LocateFixed, X } from 'lucide-react'
import { FaMicrophone } from 'react-icons/fa'
import { useNavigation } from '../hooks/useNavigation'
import { useSearch } from '../hooks/useSearch'
import { getText } from '../utils/helpers'
import SearchSuggestions from './SearchSuggestions'

export default function SearchBar() {
  const { language, setToast, setUserLocation } = useNavigation()
  const {
    inputValue,
    setInputValue,
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
  } = useSearch()

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setToast({ en: 'Location permission is not available', mr: 'स्थान परवानगी उपलब्ध नाही' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setToast({ en: 'Current location updated', mr: 'सध्याचे स्थान अपडेट झाले' })
      },
      () => {
        setToast({ en: 'Location access was denied', mr: 'स्थान प्रवेश नाकारला' })
      },
    )
  }

  const handleSuggestionSelect = (item) => {
    selectSuggestion(item)
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  return (
    <div className="relative rounded-[20px] border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/70 sm:rounded-[28px] sm:p-3">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative flex flex-1 items-center gap-2 rounded-[16px] border border-slate-200 bg-slate-50 px-2 py-2 sm:rounded-[20px] sm:px-3 sm:py-3">
          <Search size={16} className="text-slate-400 sm:h-[18px] sm:w-[18px]" />
          <input
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value)
              setActiveIndex(-1)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={getText({ en: 'Search landmarks, roads, parks, schools...', mr: 'लँडमार्क, रस्ता, बागा, शाळा शोधा...' }, language)}
            className="w-full bg-transparent text-xs outline-none sm:text-sm"
          />
          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={14} className="sm:h-4 sm:w-4" />
            </button>
          )}

          <SearchSuggestions
            suggestions={suggestions}
            query={inputValue}
            activeIndex={activeIndex}
            onSelect={handleSuggestionSelect}
            emptyMessage=""
            isVisible={showSuggestions}
            language={language}
          />
        </div>

        <button
          type="button"
          onClick={() => setToast({ en: 'Voice search is ready', mr: 'व्हॉइस शोध तयार आहे' })}
          className="rounded-lg bg-teal-600 p-2 text-white shadow-sm sm:rounded-2xl sm:p-3"
        >
          <FaMicrophone size={14} className="sm:h-[18px] sm:w-[18px]" />
        </button>

        <button
          type="button"
          onClick={handleLocate}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 sm:rounded-2xl sm:p-3"
        >
          <LocateFixed size={14} className="sm:h-[18px] sm:w-[18px]" />
        </button>
      </div>

      {!inputValue && recentSearches.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
          {recentSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setInputValue(item)
                setActiveIndex(-1)
                setShowSuggestions(true)
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 sm:px-3 sm:py-1.5 sm:text-xs"
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={clearHistory}
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-teal-600 sm:px-2 sm:py-1 sm:text-[11px]"
          >
            Clear history
          </button>
        </div>
      )}
    </div>
  )
}
