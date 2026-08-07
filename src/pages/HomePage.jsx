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
        <div className="px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">GUIDED BY</h2>
          </div>

          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 px-2">
            <div className="flex h-full min-h-[420px] flex-col items-center justify-start text-center sm:min-h-[560px]">
              <img
                src="/ameet-satam.jpg"
                alt="Shri Ameet Satam Ji"
                className="h-[120px] w-[120px] rounded-[12px] bg-white object-cover object-top sm:h-[220px] sm:w-[220px]"
              />
              <div className="mt-6 space-y-2 sm:mt-7 sm:space-y-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-700 sm:text-[16px]">GUIDED BY</p>
                <h3 className="text-[18px] font-bold leading-tight text-slate-900 sm:text-[28px]">Shri Ameet Satam Ji</h3>
                <p className="text-[14px] font-semibold text-slate-700 sm:text-[18px]">Hon&apos;ble MLA</p>
                <p className="text-[13px] text-slate-700 sm:text-[16px]">BJP Mumbai President</p>
              </div>
            </div>

            <div className="flex h-full min-h-[420px] flex-col items-center justify-start text-center sm:min-h-[560px]">
              <img
                src="/deepak-kotekar.jpg"
                alt="Shri Deepak Kotekar Ji"
                className="h-[120px] w-[120px] rounded-[12px] bg-white object-cover object-center sm:h-[220px] sm:w-[220px]"
              />
              <div className="mt-6 space-y-2 sm:mt-7 sm:space-y-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-700 sm:text-[16px]">PROJECT INITIATED BY</p>
                <h3 className="text-[18px] font-bold leading-tight text-slate-900 sm:text-[28px]">Shri Deepak Kotekar Ji</h3>
                <p className="text-[14px] font-semibold text-slate-700 sm:text-[18px]">Hon&apos;ble Corporator</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
