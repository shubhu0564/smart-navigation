import { motion } from 'framer-motion'
import { Navigation, Star } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { getText, formatDistance } from '../utils/helpers'

export default function LandmarkCard({ landmark }) {
  const { language, setSelectedLandmark, setToast, darkMode } = useNavigation()

  return (
    <motion.article whileHover={{ y: -4, scale: 1.01 }} className={`overflow-hidden rounded-[24px] border shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
      <img src={landmark.image} alt={landmark.name} className="h-36 w-full object-cover" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{landmark.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{getText(landmark.description, language)}</p>
          </div>
          <div className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-600">
            <div className="flex items-center gap-1">
              <Star size={12} />
              {landmark.rating}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">{getText({ en: 'Category', mr: 'श्रेणी' }, language)}: {landmark.category}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">{formatDistance(landmark.distanceKm)}</span>
        </div>

        <button
          onClick={() => {
            setSelectedLandmark(landmark)
            setToast({ en: `Navigating to ${landmark.name}`, mr: `${landmark.name}कडे नेव्हिगेट करत आहोत` })
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-teal-600 px-4 py-3 text-sm font-semibold text-white"
        >
          <Navigation size={16} />
          {getText({ en: 'Navigate', mr: 'नेव्हिगेट करा' }, language)}
        </button>
      </div>
    </motion.article>
  )
}
