import { motion } from 'framer-motion'
import { MapPin, Clock3, Route, ArrowRight, Navigation, Bike, Car, Clock4 } from 'lucide-react'
import { getText } from '../utils/helpers'
import { useNavigation } from '../hooks/useNavigation'

export default function DirectionsPanel() {
  const { language, selectedLandmark, darkMode, routeInfo } = useNavigation()

  const arrivalTime = routeInfo?.arrivalTime ?? '—'
  const remainingDistance = routeInfo?.remainingDistance ?? `${selectedLandmark.walkDistanceKm ?? 1.2} km`
  const travelTime = routeInfo?.travelTime ?? `${selectedLandmark.walkTimeMin ?? 12} min`

  return (
    <motion.aside initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className={`rounded-[28px] border p-4 shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2 text-teal-600">
        <Route size={18} />
        <h2 className="text-lg font-semibold">{getText({ en: 'Live navigation', mr: 'थेट नेव्हिगेशन' }, language)}</h2>
      </div>

      <div className="mt-4 rounded-[22px] bg-gradient-to-br from-teal-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">{getText({ en: 'Destination', mr: 'गंतव्य' }, language)}</p>
            <p className="text-lg font-semibold">{selectedLandmark.name}</p>
            <p className="mt-1 text-sm text-white/80">{selectedLandmark.road}</p>
          </div>
          <div className="rounded-2xl bg-white/20 p-2">
            <MapPin size={16} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
            <Clock3 size={14} />
            <span>{travelTime}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
            <Route size={14} />
            <span>{remainingDistance}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
            <Bike size={14} />
            <span>{routeInfo?.cyclingTime ?? '12 min'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
            <Car size={14} />
            <span>{routeInfo?.drivingTime ?? '5 min'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-slate-200 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{getText({ en: 'Next turn', mr: 'पुढील वळण' }, language)}</span>
          <span className="text-teal-600">{routeInfo?.nextTurn ?? 'Follow the highlighted route'}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span className="flex items-center gap-2"><Clock4 size={14} /> {getText({ en: 'ETA', mr: 'आगमन अंदाज' }, language)}</span>
          <span>{arrivalTime}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {selectedLandmark.steps?.map((step, index) => (
          <div key={index} className={`flex items-start gap-3 rounded-[18px] p-3 ${darkMode ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600/10 text-sm font-semibold text-teal-600">{index + 1}</div>
            <div>
              <p className="text-sm font-medium">{getText(step, language)}</p>
              <p className="mt-1 text-xs text-slate-500">{getText({ en: 'Guided waypoint', mr: 'मार्गदर्शक बिंदू' }, language)}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] bg-teal-600 px-4 py-3 text-sm font-semibold text-white">
        {getText({ en: 'Start navigation', mr: 'नेव्हिगेशन सुरू करा' }, language)}
        <Navigation size={16} />
      </button>
    </motion.aside>
  )
}
