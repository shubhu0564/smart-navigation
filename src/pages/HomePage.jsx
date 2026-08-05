import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import MapContainer from '../components/MapContainer'
import CategoryGrid from '../components/CategoryGrid'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'

export default function HomePage() {
  const { language, darkMode } = useNavigation()

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[32px] border p-8 shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-gradient-to-br from-sky-600 via-teal-600 to-blue-600 text-white'}`}
      >
        <div className="max-w-3xl space-y-4">
          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl text-white">{getText({ en: "Let's Explore", mr: 'चला शोधूया' }, language)}</h1>
          <p className="text-2xl font-bold text-white sm:text-3xl">{getText({ en: 'Gulmohar JVPD Scheme Area', mr: 'गुलमोहर JVPD योजना क्षेत्र' }, language)}</p>
        </div>
      </motion.section>

      <section id="landmark-map-section" className="space-y-6">
        <SearchBar />
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-600">{getText({ en: 'Landmark Categories', mr: 'लँडमार्क वर्ग' }, language)}</p>
              <p className="text-sm text-slate-500">{getText({ en: 'Filter places by type and focus the map.', mr: 'टाइपनुसार स्थळे फिल्टर करा आणि नकाशावर लक्ष केंद्रित करा.' }, language)}</p>
            </div>
          </div>
          <CategoryGrid />
        </div>
        <MapContainer />
      </section>
    </div>
  )
}
