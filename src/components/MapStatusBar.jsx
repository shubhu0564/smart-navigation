import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CloudSun, Clock3, Gauge, ThermometerSun } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'
import { fetchGulmoharAreaStatus } from '../services/mapStatusService'

function StatusTile({ label, value, icon: Icon, darkMode }) {
  return (
    <div className={`rounded-[18px] border px-3 py-3 ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <Icon size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 break-words text-[16px] font-bold leading-snug text-slate-950 dark:text-slate-50 sm:text-[17px]">{value}</p>
    </div>
  )
}

export default function MapStatusBar() {
  const { language, darkMode } = useNavigation()
  const [expanded, setExpanded] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [status, setStatus] = useState({
    aqi: 'Data unavailable',
    weatherCondition: 'Data unavailable',
    temperature: 'Data unavailable',
  })

  useEffect(() => {
    let mounted = true

    fetchGulmoharAreaStatus()
      .then((nextStatus) => {
        if (mounted) {
          setStatus(nextStatus)
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus({
            aqi: 'Data unavailable',
            weatherCondition: 'Data unavailable',
            temperature: 'Data unavailable',
          })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const timeLabel = useMemo(() => {
    return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }, [now])

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setExpanded((current) => !current)}
      className={`w-full rounded-[26px] border px-4 py-4 text-left shadow-sm transition ${darkMode ? 'border-slate-800 bg-slate-900/80 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
      aria-expanded={expanded}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{getText({ en: 'Area status', mr: 'क्षेत्र स्थिती' }, language)}</p>
          <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {getText({ en: 'Tap for AQI, weather and time', mr: 'AQI, हवामान आणि वेळ पाहण्यासाठी टॅप करा' }, language)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>
            <span>AQI {status.aqi}</span>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>
            <span>{status.temperature}</span>
          </div>
          <ChevronDown className={`transition ${expanded ? 'rotate-180' : ''} ${darkMode ? 'text-slate-200' : 'text-slate-600'}`} size={16} />
        </div>
      </div>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <StatusTile label="AQI" value={status.aqi} icon={Gauge} darkMode={darkMode} />
              <StatusTile label="Weather" value={status.weatherCondition} icon={CloudSun} darkMode={darkMode} />
              <StatusTile label="Temperature" value={status.temperature} icon={ThermometerSun} darkMode={darkMode} />
              <StatusTile label="Current time" value={timeLabel} icon={Clock3} darkMode={darkMode} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  )
}