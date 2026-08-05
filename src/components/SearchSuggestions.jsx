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
                {suggestions.map((item, index) => (
                  <SearchResultCard key={item.id} item={item} query={query} isActive={index === activeIndex} onSelect={onSelect} language={language} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
