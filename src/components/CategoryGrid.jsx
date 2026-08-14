import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'
import { normalizeLandmarkFeature } from '../utils/geoJsonUtils'

export default function CategoryGrid() {
  const { language, selectedCategory, setSelectedCategory, darkMode, categories, landmarks, setSelectedLandmark, geoJson } = useNavigation()

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
    if (categoryId === 'all') return

    // Prefer derived landmarks (from client buildings) so placement and fit use original building geometry
    if (categoryId === 'busStop' && geoJson.busStops?.features?.length) {
      const feature = geoJson.busStops.features[0]
      const normalized = normalizeLandmarkFeature(feature)
      if (normalized) normalized.feature = feature
      setSelectedLandmark(normalized)
      return
    }

    if (landmarks && landmarks.length > 0) {
      const found = landmarks.find((l) => l.category === categoryId) || landmarks[0]
      if (found) {
        setSelectedLandmark(found)
        return
      }
    }

    // fallback: attempt to use geoJson.landmarks but avoid relying on it for placement
    if (geoJson.landmarks?.features?.length) {
      const feature = geoJson.landmarks.features.find((f) => normalizeLandmarkFeature(f)?.category === categoryId) || geoJson.landmarks.features[0]
      if (feature) {
        const normalized = normalizeLandmarkFeature(feature)
        if (normalized) {
          normalized.feature = feature
          setSelectedLandmark(normalized)
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {categories.map((category) => {
        const Icon = Icons[category.icon] ?? Icons.Compass
        const active = selectedCategory === category.id
        return (
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`rounded-[16px] border p-2 text-left shadow-sm transition duration-200 sm:rounded-[24px] sm:p-4 ${active ? 'border-teal-600 bg-teal-600 text-white shadow-lg' : darkMode ? 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-500 hover:bg-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg sm:mb-3 sm:h-11 sm:w-11 sm:rounded-2xl ${active ? 'bg-white/20 text-white' : 'bg-teal-600/10 text-teal-600'}`}>
              <Icon size={16} className="sm:h-5 sm:w-5" />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <p className="text-xs font-semibold leading-4 sm:text-sm sm:leading-5">{getText(category.label, language)}</p>
              {category.count > 0 ? (
                <span className="text-[10px] font-medium text-slate-500 sm:text-xs">({category.count})</span>
              ) : null}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
