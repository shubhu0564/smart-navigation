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

      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 space-y-12">
          <div className="space-y-5 text-center">
            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">GUIDED BY</h2>
            <div className="mx-auto h-[180px] w-[180px] overflow-hidden rounded-[16px] shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:h-[220px] sm:w-[220px]">
              <img
                src="/ameet-satam.jpg"
                alt="Shri. Ameet Satam Ji"
                className="h-full w-full object-cover object-[center_top]"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-[28px] font-semibold leading-tight text-slate-900 sm:text-[34px]">Shri. Ameet Satam Ji</h3>
              <p className="text-[18px] font-medium leading-tight text-slate-700 sm:text-[22px]">Hon&apos;ble MLA &</p>
              <p className="text-[18px] leading-tight text-slate-700 sm:text-[22px]">President of Mumbai BJP</p>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">PROJECT INITIATED BY</h2>
            <div className="mx-auto h-[180px] w-[180px] overflow-hidden rounded-[16px] shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:h-[220px] sm:w-[220px]">
              <img
                src="/deepak-kotekar.jpg"
                alt="Shri. Deepak Kotekar Ji"
                className="h-full w-full object-cover object-[center_12%]"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-[28px] font-semibold leading-tight text-slate-900 sm:text-[34px]">Shri. Deepak Kotekar Ji</h3>
              <p className="text-[18px] font-medium leading-tight text-slate-700 sm:text-[22px]">Hon&apos;ble Corporator</p>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">SUPPORTED BY</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              <div className="flex flex-col items-center text-center gap-3 px-2">
                <img
                  src="/gulmohar%20logo_png.png"
                  alt="GASWG Logo"
                  className="h-[80px] w-[80px] object-contain transition duration-200 hover:scale-105 sm:h-24 sm:w-24"
                />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">GASWG</h3>
                  <p className="text-sm leading-6 text-slate-700">Gulmohar Area Societies Welfare Group</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3 px-2">
                <img
                  src="/ALM.jpeg"
                  alt="Gulmohar ALM-67"
                  className="h-[80px] w-[80px] object-contain transition duration-200 hover:scale-105 sm:h-24 sm:w-24"
                />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Gulmohar ALM-67</h3>
                  <p className="text-sm leading-6 text-slate-700">Strong Community, Better Neighbourhood</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">DESIGNED BY</h2>
            <a
              href="https://sapthakalaa.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-full bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <img
                src="/LOGO%20DESIGN%20for%20print_png.png"
                alt="Sapthakalaa Environmental Design, Planning and Management"
                className="h-32 w-auto object-contain"
              />
            </a>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Sapthakalaa
              </h3>
              <p className="text-[18px] leading-[1.6] text-slate-700 sm:text-[16px]">
                Environmental Design,
                <br />
                Planning and Management
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
