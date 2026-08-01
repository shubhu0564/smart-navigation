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
            <div className="min-w-0">
              <h1 className="text-3xl font-bold leading-tight tracking-[0.01em] text-teal-600 sm:text-4xl">
                GULMOHAR JVPD SCHEME
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300 sm:text-base">
                K/West Ward – 67, Brihanmumbai Municipal Corporation
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-teal-600/10 px-3 py-2 text-sm font-medium text-teal-600">
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
