import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
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
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
