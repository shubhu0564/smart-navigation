import { motion, AnimatePresence } from 'framer-motion'
import SearchResultCard from './SearchResultCard'

export default function SearchSuggestions({
  suggestions,
  query,
  activeIndex,
  onSelect,
  emptyMessage,
  isVisible,
  language,
}) {
  const hasResults = Array.isArray(suggestions) && suggestions.length > 0

  return (
    <AnimatePresence>
      {isVisible && hasResults && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="absolute left-0 right-0 top-full z-[1200] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          <div className="max-h-[260px] overflow-y-auto p-1.5">
            <div className="space-y-1">
              {suggestions.map((item, index) => {
                const key =
                  typeof item === 'string'
                    ? `recent-${item}`
                    : (item.id ?? `${item.name ?? 'sugg'}-${item.latitude ?? ''}-${item.longitude ?? ''}`)

                return (
                  <SearchResultCard
                    key={key}
                    item={item}
                    query={query}
                    isActive={index === activeIndex}
                    onSelect={onSelect}
                    language={language}
                  />
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
