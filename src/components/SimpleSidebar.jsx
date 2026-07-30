import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'

const items = [
  { label: 'Home', path: '/' },
  { label: 'Landmarks', path: '/navigation' },
  { label: 'Roads', path: '/nearby' },
  { label: 'Parks', path: '/navigation' },
  { label: 'Schools', path: '/navigation' },
  { label: 'Educational Institutes', path: '/navigation' },
  { label: 'Government Offices', path: '/navigation' },
  { label: 'Research Institutes', path: '/navigation' },
  { label: 'Community Centres', path: '/navigation' },
  { label: 'Temples', path: '/navigation' },
  { label: 'Bus Stops', path: '/navigation' },
  { label: 'Public Toilets', path: '/navigation' },
  { label: 'About', path: '/about' },
]

export default function SimpleSidebar() {
  const { menuOpen, setMenuOpen, darkMode } = useNavigation()

  return (
    <AnimatePresence>
      {menuOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className={`fixed left-0 top-0 z-[80] flex h-full w-72 flex-col border-r p-4 shadow-2xl ${darkMode ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Gulmohar</p>
                <h2 className="text-lg font-semibold">Navigation</h2>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} className="rounded-full border border-slate-200 p-2">
                <X size={16} />
              </button>
            </div>
            <div className="mt-6 space-y-2">
              {items.map((item) => (
                <button key={item.label} type="button" className={`flex w-full items-center rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
