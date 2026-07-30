import { motion } from 'framer-motion'
import { Compass, Navigation, MapPinned, RotateCcw, Radio, Maximize2 } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'

export default function FloatingActionBar({ onLocate, onNavigate, onReset, onGoogleMaps, onFullscreen, onLiveGps }) {
  const { darkMode } = useNavigation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute bottom-4 right-4 z-[1000] flex flex-col gap-2 rounded-[24px] border p-2 shadow-xl ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/95'}`}
    >
      <button type="button" onClick={onLocate} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
        <Compass size={16} />
      </button>
      <button type="button" onClick={onNavigate} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white transition hover:bg-teal-700">
        <Navigation size={16} />
      </button>
      <button type="button" onClick={onGoogleMaps} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
        <MapPinned size={16} />
      </button>
      <button type="button" onClick={onReset} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
        <RotateCcw size={16} />
      </button>
      <button type="button" onClick={onLiveGps} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
        <Radio size={16} />
      </button>
      <button type="button" onClick={onFullscreen} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
        <Maximize2 size={16} />
      </button>
    </motion.div>
  )
}
