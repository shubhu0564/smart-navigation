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

      <section className="border-t border-slate-200 bg-white pt-8">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold uppercase tracking-[0.25em] text-slate-800 sm:text-2xl">GUIDED BY</h2>
        </div>

        <div className="grid gap-12 px-4 md:grid-cols-2">
          <div className="flex flex-col items-center text-center">
            <img
              src="/ameet-satam.jpg"
              alt="Shri Ameet Satam Ji"
              className="h-40 w-40 rounded-full border-4 border-white object-cover object-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
            />
            <h3 className="mt-5 text-lg font-bold text-slate-900">Shri Ameet Satam Ji</h3>
            <p className="mt-2 text-sm font-medium text-slate-700">Hon&apos;ble MLA</p>
            <p className="mt-1 text-sm text-slate-600">BJP Mumbai President</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <img
              src="/deepak-kotekar.jpg"
              alt="Shri Deepak Kotekar Ji"
              className="h-40 w-40 rounded-full border-4 border-white object-cover object-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
            />
            <h3 className="mt-5 text-lg font-bold text-slate-900">Shri Deepak Kotekar Ji</h3>
            <p className="mt-2 text-sm font-medium text-slate-700">Hon&apos;ble Corporator</p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200"></div>
      </section>
    </div>
  )
}
