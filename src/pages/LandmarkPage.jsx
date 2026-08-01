import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Star, Route } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { getText, formatDistance } from '../utils/helpers'

export default function LandmarkPage() {
  const { id } = useParams()
  const { language, darkMode, setSelectedLandmark, landmarks } = useNavigation()
  const item = landmarks.find((entry) => entry.id === Number(id)) || landmarks[0]

  return (
    <div className="space-y-6">
      <Link to="/nearby" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600">
        <ArrowLeft size={16} />
        {getText({ en: 'Back to nearby places', mr: 'जवळच्या स्थळांकडे परत' }, language)}
      </Link>
      <div className={`overflow-hidden rounded-[32px] border shadow-sm ${darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
        <img src={item.image} alt={item.name} className="h-64 w-full object-cover" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-600">{item.category}</p>
              <h2 className="text-2xl font-semibold">{item.name}</h2>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-600">
              <div className="flex items-center gap-1">
                <Star size={14} />
                {item.rating}
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">{getText(item.description, language)}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm">{formatDistance(item.distanceKm)}</div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm">{item.address}</div>
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-teal-600">
              <Route size={16} />
              <h3 className="font-semibold">{getText({ en: 'Suggested path', mr: 'सुचवलेला मार्ग' }, language)}</h3>
            </div>
            <div className="mt-4 space-y-3">
              {item.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600/10 text-sm font-semibold text-teal-600">{index + 1}</div>
                  <p className="text-sm">{getText(step, language)}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setSelectedLandmark(item)} className="mt-6 inline-flex items-center gap-2 rounded-[16px] bg-teal-600 px-4 py-3 text-sm font-semibold text-white">
            <MapPin size={16} />
            {getText({ en: 'Start navigation', mr: 'नेव्हिगेशन सुरू करा' }, language)}
          </button>
        </div>
      </div>
    </div>
  )
}
