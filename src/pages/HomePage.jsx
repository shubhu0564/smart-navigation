import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ShieldCheck, Smartphone } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'
import CurrentLocationCard from '../components/CurrentLocationCard'
import MapContainer from '../components/MapContainer'
import DirectionsPanel from '../components/DirectionsPanel'
import NearbyPlaces from '../components/NearbyPlaces'
import LandmarkCard from '../components/LandmarkCard'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'
import { landmarks } from '../data/landmarks'

export default function HomePage() {
  const { language, darkMode, setToast } = useNavigation()

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-[32px] border p-6 shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-gradient-to-br from-teal-600 to-blue-600 text-white'}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
              <Sparkles size={14} />
              {getText({ en: 'Smart Navigation', mr: 'स्मार्ट नेव्हिगेशन' }, language)}
            </div>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              {getText({ en: 'Navigate campus and landmarks with elegant precision.', mr: 'सुंदर अचूकतेने कॅम्पस आणि लँडमार्क नेव्हिगेट करा.' }, language)}
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              {getText({ en: 'Experience a premium, mobile-first wayfinding interface inspired by modern mapping platforms.', mr: 'आधुनिक मॅपिंग प्लॅटफॉर्मपासून प्रेरित प्रीमियम मोबाइल-फर्स्ट वेफायरिंग इंटरफेस अनुभव द्या.' }, language)}
            </p>
          </div>
          <button onClick={() => setToast({ en: 'QR navigation is enabled', mr: 'क्यूआर नेव्हिगेशन सक्षम आहे' })} className="flex items-center gap-2 rounded-full bg-white px-4 py-3 font-semibold text-teal-700">
            {getText({ en: 'Open QR navigation', mr: 'क्यूआर नेव्हिगेशन उघडा' }, language)}
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SearchBar />
          <CategoryGrid />
          <MapContainer />
        </div>
        <div className="space-y-6">
          <CurrentLocationCard />
          <DirectionsPanel />
          <NearbyPlaces />
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-600">Featured landmarks</p>
            <h3 className="text-xl font-semibold">{getText({ en: 'Popular destinations', mr: 'लोकप्रिय स्थळे' }, language)}</h3>
          </div>
          <button className="text-sm font-semibold text-teal-600">{getText({ en: 'See all', mr: 'सर्व पहा' }, language)}</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {landmarks.slice(0, 2).map((landmark) => (
            <LandmarkCard key={landmark.id} landmark={landmark} />
          ))}
        </div>
      </section>

      <section className={`rounded-[32px] border p-6 shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-600">{getText({ en: 'Why BMC Mumbai', mr: 'बीएमसी मुंबई का?' }, language)}</p>
            <h3 className="text-xl font-semibold">{getText({ en: 'Trusted by visitors and campus teams alike.', mr: 'अभ्यागत आणि कॅम्पस टीम दोन्हीद्वारे विश्वासार्ह.' }, language)}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-teal-600"><ShieldCheck size={16} /> Secure routing</div>
            </div>
            <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-teal-600"><Smartphone size={16} /> Mobile ready</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
