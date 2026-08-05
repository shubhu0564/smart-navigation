import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import MapContainer from '../components/MapContainer'
import CategoryGrid from '../components/CategoryGrid'
import PublicRepresentatives from '../components/PublicRepresentatives'
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
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <span className="text-xl font-semibold">i</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">{getText({ en: 'Information Board', mr: 'माहिती बोर्ड' }, language)}</p>
                <h2 className="text-xl font-semibold text-slate-900">Gulmohar JVPD Scheme, K/West Ward - 67</h2>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
            <p>
              In 1950, the Government of Bombay acquired over 220 acres along the Irla Nullah to develop a planned residential neighbourhood. The project was executed by the Bombay Housing Board (BHB), later known as MHADA, making it one of Mumbai&apos;s earliest planned housing developments.
            </p>
            <p>
              The master plan created two distinct precincts: JVPD with low-density bungalow plots, and Gulmohar Road with apartments for middle-income families.
            </p>
            <p>
              Since becoming part of MHADA in 1977, the area has remained a landmark of Mumbai&apos;s planned urban development.
            </p>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500"> </div>
        </section>
      </section>
    </div>
  )
}
