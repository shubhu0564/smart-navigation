import { Search, LocateFixed, X } from 'lucide-react'
import { FaMicrophone } from 'react-icons/fa'
import { useNavigation } from '../hooks/useNavigation'
import { useSearch } from '../hooks/useSearch'
import { getText } from '../utils/helpers'
import SearchSuggestions from './SearchSuggestions'

export default function SearchBar() {
  const { language, setToast, setUserLocation } = useNavigation()
  const { inputValue, setInputValue, suggestions, activeIndex, setActiveIndex, showSuggestions, setShowSuggestions, recentSearches, selectSuggestion, clearInput, clearHistory, handleKeyDown } = useSearch()

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

  return (
    <div className="relative rounded-[28px] border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70">
      <div className="flex items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2 rounded-[20px] border border-slate-200 bg-slate-50 px-3 py-3">
          <Search size={18} className="text-slate-400" />
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
            className="w-full bg-transparent text-sm outline-none"
          />
          {inputValue && (
            <button type="button" onClick={clearInput} className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
              <X size={16} />
            </button>
          )}
          <SearchSuggestions
            suggestions={suggestions}
            query={inputValue}
            activeIndex={activeIndex}
            onSelect={selectSuggestion}
            emptyMessage={getText({ en: 'No matching locations found.', mr: 'कुणतीही जुळणारी स्थळे सापडली नाहीत.' }, language)}
            isVisible={showSuggestions}
            language={language}
          />
        </div>
        <button type="button" onClick={() => setToast({ en: 'Voice search is ready', mr: 'व्हॉइस शोध तयार आहे' })} className="rounded-2xl bg-teal-600 p-3 text-white shadow-sm">
          <FaMicrophone size={18} />
        </button>
        <button type="button" onClick={handleLocate} className="rounded-2xl border border-slate-200 p-3 text-slate-600">
          <LocateFixed size={18} />
        </button>
      </div>
      {!inputValue && recentSearches.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {recentSearches.map((item) => (
            <button key={item} type="button" onClick={() => { setInputValue(item); setShowSuggestions(true) }} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              {item}
            </button>
          ))}
          <button type="button" onClick={clearHistory} className="rounded-full px-2 py-1 text-[11px] font-semibold text-teal-600">
            Clear history
          </button>
        </div>
      )}
    </div>
  )
}
