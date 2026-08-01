import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import Navbar from '../components/Navbar'
import SimpleSidebar from '../components/SimpleSidebar'
import Footer from '../components/Footer'

export default function MainLayout() {
  const location = useLocation()
  const { darkMode } = useNavigation()

  const pageLabel = location.pathname.replace('/', '') || 'Home'
  const breadcrumbLabel = pageLabel === 'Home' ? 'Home' : pageLabel.replace(/-/g, ' ')

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      <SimpleSidebar />
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 rounded-[28px] border px-4 py-3 shadow-sm backdrop-blur ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-white/70 bg-white/80'}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-teal-600">GULMOHAR JVPD SCHEME</p>
              <h1 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{breadcrumbLabel}</h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-teal-600/10 px-3 py-2 text-sm font-medium text-teal-600">
              <Compass size={16} />
              <span>Live GIS routing</span>
            </div>
          </div>
        </motion.header>

        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
