import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'

export default function CategoryGrid() {
  const { language, selectedCategory, setSelectedCategory, darkMode, categories } = useNavigation()

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {categories.map((category) => {
        const Icon = Icons[category.icon] ?? Icons.Compass
        const active = selectedCategory === category.id
        return (
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-[24px] border p-4 text-left shadow-sm transition duration-200 ${active ? 'border-teal-600 bg-teal-600 text-white shadow-lg' : darkMode ? 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-500 hover:bg-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${active ? 'bg-white/20 text-white' : 'bg-teal-600/10 text-teal-600'}`}>
              <Icon size={20} />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-5">{getText(category.label, language)}</p>
              {category.count > 0 ? (
                <span className="text-xs font-medium text-slate-500">({category.count})</span>
              ) : null}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
