import { Outlet } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import Navbar from '../components/Navbar'
import SimpleSidebar from '../components/SimpleSidebar'
import Footer from '../components/Footer'

export default function MainLayout() {
  const { darkMode } = useNavigation()

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      <SimpleSidebar />
      <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
