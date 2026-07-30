import { motion } from 'framer-motion'
import { FaBuilding, FaChurch, FaLandmark, FaMapMarkedAlt, FaSchool, FaTree } from 'react-icons/fa'
import { highlightText } from '../utils/searchUtils'

const iconMap = {
  Park: FaTree,
  School: FaSchool,
  Government: FaBuilding,
  Community: FaLandmark,
  Temple: FaChurch,
  default: FaMapMarkedAlt,
}

export default function SearchResultCard({ item, query, isActive, onSelect }) {
  const Icon = iconMap[item.category] ?? iconMap.default
  const segments = highlightText(item.name, query)

  return (
    <motion.button
      whileHover={{ x: 3, scale: 1.005 }}
      type="button"
      onClick={() => onSelect(item)}
      className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${isActive ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'}`}
    >
      <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-teal-600">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">
            {segments.map((segment, index) => (
              <span key={`${segment.text}-${index}`} className={segment.isMatch ? 'rounded bg-teal-100 px-0.5 text-teal-700' : ''}>
                {segment.text}
              </span>
            ))}
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            {item.category}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">
          {item.road}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          {item.description}
        </p>
      </div>
    </motion.button>
  )
}
