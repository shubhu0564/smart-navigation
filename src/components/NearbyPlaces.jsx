import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { getText, formatDistance } from '../utils/helpers'

export default function NearbyPlaces() {
  const { language, landmarks, darkMode, selectedCategory, searchQuery, setSelectedLandmark, setToast } = useNavigation()

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return landmarks.filter((landmark) => {
      const categoryMatch = selectedCategory === 'all' || landmark.category === selectedCategory
      const searchMatch = !query || [landmark.name, landmark.road, landmark.category, landmark.number].some((value) => value.toLowerCase().includes(query))
      return categoryMatch && searchMatch
    })
  }, [landmarks, searchQuery, selectedCategory])

  return (
    <div className={`rounded-[28px] border p-4 shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-600">Nearby places</p>
          <h3 className="text-lg font-semibold">{getText({ en: 'Sorted by distance', mr: 'अंतरानुसार क्रमवारी' }, language)}</h3>
        </div>
        <button className="text-sm font-medium text-teal-600">{getText({ en: 'View all', mr: 'सर्व पाहा' }, language)}</button>
      </div>
      <div className="space-y-3">
        {visible.map((landmark) => (
          <motion.button
            key={landmark.id}
            whileHover={{ x: 4 }}
            onClick={() => {
              setSelectedLandmark(landmark)
              setToast({ en: `Focused on ${landmark.name}`, mr: `${landmark.name}कडे केंद्रित केले` })
            }}
            className={`flex w-full items-center justify-between rounded-[20px] border p-3 text-left ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-600/10 p-2 text-teal-600">
                <MapPin size={16} />
              </div>
              <div>
                <p className="font-semibold">{landmark.number} · {landmark.name}</p>
                <p className="text-sm text-slate-500">{landmark.road}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              {formatDistance(landmark.distanceKm)}
              <ArrowRight size={16} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
