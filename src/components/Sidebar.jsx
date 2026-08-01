import { Link } from 'react-router-dom'
import { X, MapPinned, Home, Search, Landmark, Trees, School, Building2, Church, Users, Bus, Toilet, Info } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'

const navigationItems = [
  { key: 'home', label: { en: 'Home', mr: 'मुख्यपृष्ठ' }, icon: Home, path: '/' },
  { key: 'search', label: { en: 'Search', mr: 'शोध' }, icon: Search, path: '/navigation' },
  { key: 'landmarks', label: { en: 'Landmarks', mr: 'लँडमार्क' }, icon: Landmark, path: '/navigation' },
  { key: 'roads', label: { en: 'Roads', mr: 'रस्ते' }, icon: MapPinned, path: '/navigation' },
  { key: 'parks', label: { en: 'Parks', mr: 'बागा' }, icon: Trees, path: '/navigation' },
  { key: 'schools', label: { en: 'Schools', mr: 'शाळा' }, icon: School, path: '/navigation' },
  { key: 'institutes', label: { en: 'Educational Institutes', mr: 'शैक्षणिक संस्था' }, icon: Building2, path: '/navigation' },
  { key: 'government', label: { en: 'Government Offices', mr: 'सरकारी कार्यालये' }, icon: Building2, path: '/navigation' },
  { key: 'community', label: { en: 'Community Centres', mr: 'समुदाय केंद्रे' }, icon: Landmark, path: '/navigation' },
  { key: 'temples', label: { en: 'Temples', mr: 'मंदिर' }, icon: Church, path: '/navigation' },
  { key: 'bus', label: { en: 'Bus Stops', mr: 'बस थांबे' }, icon: Bus, path: '/navigation' },
  { key: 'toilets', label: { en: 'Public Toilets', mr: 'सार्वजनिक शौचालये' }, icon: Toilet, path: '/navigation' },
  { key: 'about', label: { en: 'About', mr: 'आमच्याबद्दल' }, icon: Info, path: '/about' },
]

const categoryOptions = [
  { key: 'Park', label: { en: 'Parks', mr: 'बागा' }, icon: Trees },
  { key: 'School', label: { en: 'Schools', mr: 'शाळा' }, icon: School },
  { key: 'Institute', label: { en: 'Educational Institutes', mr: 'शैक्षणिक संस्था' }, icon: Building2 },
  { key: 'Government', label: { en: 'Government Offices', mr: 'सरकारी कार्यालये' }, icon: Building2 },
  { key: 'Temple', label: { en: 'Temples', mr: 'मंदिर' }, icon: Church },
  { key: 'Club', label: { en: 'Clubs', mr: 'क्लब' }, icon: Users },
  { key: 'Bus Stop', label: { en: 'Bus Stops', mr: 'बस थांबे' }, icon: Bus },
  { key: 'Public Toilet', label: { en: 'Public Toilets', mr: 'सार्वजनिक शौचालये' }, icon: Toilet },
]

export default function Sidebar() {
  const { menuOpen, setMenuOpen, language, darkMode, setSelectedLandmark, setSelectedCategory, setToast, enabledCategories, setEnabledCategories, landmarks } = useNavigation()

  const focusCategory = (category) => {
    const match = landmarks.find((item) => item.category === category)
    if (match) {
      setSelectedCategory(category)
      setSelectedLandmark(match)
      setToast({ en: `Focused on ${match.name}`, mr: `${match.name}कडे केंद्रित केले` })
    }
  }

  const toggleCategory = (category) => {
    setEnabledCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])
  }

  return (
    <div className={`fixed inset-0 z-[60] transition ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
      <aside className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] border-r p-5 shadow-2xl backdrop-blur ${darkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Gulmohar JVPD</p>
            <h2 className="text-lg font-semibold">Navigation layers</h2>
          </div>
          <button onClick={() => setMenuOpen(false)} className="rounded-full border border-slate-200 p-2">
            <X size={16} />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-2">
          {navigationItems.map(({ key, label, icon: Icon, path }) => (
            <Link key={key} to={path} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
              <Icon size={16} />
              {label[language]}
            </Link>
          ))}
        </nav>

        <div className="mt-6 rounded-[24px] border border-slate-200 p-3">
          <p className="text-sm font-semibold">Layer filters</p>
          <div className="mt-3 space-y-2">
            {categoryOptions.map(({ key, label, icon: Icon }) => {
              const active = enabledCategories.includes(key)
              return (
                <button key={key} onClick={() => { toggleCategory(key); focusCategory(key) }} className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm ${active ? 'bg-teal-600 text-white' : darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                  <span className="flex items-center gap-2"><Icon size={14} /> {label[language]}</span>
                  <span className="text-xs">{active ? 'On' : 'Off'}</span>
                </button>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}
