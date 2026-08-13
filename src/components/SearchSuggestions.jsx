import { motion, AnimatePresence } from 'framer-motion'
import SearchResultCard from './SearchResultCard'

export default function SearchSuggestions({ suggestions, query, activeIndex, onSelect, emptyMessage, isVisible, language }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute left-0 right-0 top-full z-[1100] mt-2 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl"
        >
          <div className="max-h-[320px] overflow-y-auto p-2">
            {suggestions.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-3 py-4 text-sm text-slate-600">{emptyMessage}</div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((item, index) => {
                  // suggestions may be recent search strings or normalized objects.
                  // Use a stable key: prefer explicit `id`, then derive from identifying props, finally fall back to the string value.
                  const key = typeof item === 'string'
                    ? `recent-${item}`
                    : (item.id ?? `${item.name ?? 'sugg'}-${item.latitude ?? ''}-${item.longitude ?? ''}`)
                  return <SearchResultCard key={key} item={item} query={query} isActive={index === activeIndex} onSelect={onSelect} language={language} />
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
