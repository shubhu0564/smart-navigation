import { MapPin, Navigation } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'

export default function CurrentLocationCard() {
  const { language, darkMode } = useNavigation()

  return (
    <div className={`rounded-[24px] border p-4 shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-600">{getText({ en: 'Current location', mr: 'सध्याचे स्थान' }, language)}</p>
          <p className="mt-1 text-sm text-slate-500">North Avenue, BMC Mumbai Campus</p>
        </div>
        <div className="rounded-2xl bg-teal-600/10 p-2 text-teal-600">
          <MapPin size={18} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
        <span className="text-sm text-slate-500">{getText({ en: 'GPS status', mr: 'जीपीएस स्थिती' }, language)}</span>
        <span className="flex items-center gap-2 text-sm font-semibold text-teal-600">
          <Navigation size={14} />
          {getText({ en: 'Connected', mr: 'जोडलेले' }, language)}
        </span>
      </div>
    </div>
  )
}
