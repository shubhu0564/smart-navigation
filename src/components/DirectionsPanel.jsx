import { motion } from 'framer-motion'
import { Clock3, Route, Navigation, Bike, Car, MapPin } from 'lucide-react'
import { getText } from '../utils/helpers'
import { useNavigation } from '../hooks/useNavigation'

export default function DirectionsPanel() {
  const { language, selectedLandmark, darkMode, routeInfo } = useNavigation()

  const walkingTime = routeInfo?.travelTime ?? `${selectedLandmark?.walkTimeMin ?? 12} min`
  const drivingTime = routeInfo?.drivingTime ?? '5 min'
  const cyclingTime = routeInfo?.cyclingTime ?? '12 min'
  const distance = routeInfo?.remainingDistance ?? `${selectedLandmark?.walkDistanceKm ?? 1.2} km`
  const nextTurn = routeInfo?.nextTurn ?? 'Follow the highlighted route'
  const arrivalTime = routeInfo?.arrivalTime ?? '—'

  return (
    <motion.aside initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className={`rounded-[28px] border p-4 shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2 text-teal-600">
        <Route size={18} />
        <h2 className="text-lg font-semibold">{getText({ en: 'Live Navigation', mr: 'थेट नेव्हिगेशन' }, language)}</h2>
      </div>

      <div className="mt-4 rounded-[22px] bg-gradient-to-br from-teal-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-white/80">{getText({ en: 'Destination', mr: 'गंतव्य' }, language)}</p>
            <p className="text-lg font-semibold">{selectedLandmark?.name ?? '—'}</p>
            <p className="mt-1 text-sm text-white/80">{selectedLandmark?.road ?? ''}</p>
          </div>
          <div className="rounded-2xl bg-white/20 p-2">
            <MapPin size={16} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
            <Clock3 size={14} />
            <span>{getText({ en: 'Walking time', mr: 'पायी वेळ' }, language)}: {walkingTime}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
            <Car size={14} />
            <span>{getText({ en: 'Driving time', mr: 'ड्रायव्हिंग वेळ' }, language)}: {drivingTime}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
            <Bike size={14} />
            <span>{getText({ en: 'Cycling time', mr: 'सायकलिंग वेळ' }, language)}: {cyclingTime}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
            <Route size={14} />
            <span>{getText({ en: 'Distance', mr: 'अंतर' }, language)}: {distance}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-[20px] border border-slate-200 p-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">{getText({ en: 'Next Turn', mr: 'पुढील वळण' }, language)}</p>
          <p className="mt-1 text-sm text-slate-600">{nextTurn}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">{getText({ en: 'Navigation Instructions', mr: 'नेव्हिगेशन सूचना' }, language)}</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {(selectedLandmark?.steps ?? []).slice(0, 3).map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-teal-500" />
                <span>{getText(step, language)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{getText({ en: 'Arrival', mr: 'आगमन' }, language)}</span>
          <span className="font-medium text-slate-700">{arrivalTime}</span>
        </div>
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] bg-teal-600 px-4 py-3 text-sm font-semibold text-white">
        {getText({ en: 'Start Navigation', mr: 'नेव्हिगेशन सुरू करा' }, language)}
        <Navigation size={16} />
      </button>
    </motion.aside>
  )
}
