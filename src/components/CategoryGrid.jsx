import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { categories } from '../data/landmarks'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'

export default function CategoryGrid() {
  const { language, selectedCategory, setSelectedCategory, darkMode } = useNavigation()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => {
        const Icon = Icons[category.icon] ?? Icons.Compass
        const active = selectedCategory === category.id
        return (
          <motion.button
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-[22px] border p-3 text-left shadow-sm transition ${active ? 'border-teal-600 bg-teal-600 text-white' : darkMode ? 'border-slate-800 bg-slate-900/70 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}
          >
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-white/20' : 'bg-teal-600/10 text-teal-600'}`}>
              <Icon size={18} />
            </div>
            <p className="text-sm font-semibold">{getText(category.label, language)}</p>
          </motion.button>
        )
      })}
    </div>
  )
}
