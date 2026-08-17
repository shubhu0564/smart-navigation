import { useState } from 'react'
import {
  Compass,
  LocateFixed,
  MapPinned,
  RotateCcw,
  Radio,
  Maximize2,
  Minimize2,
  Navigation,
} from 'lucide-react'

export default function FloatingActionBar({
  onLocate,
  onNavigate,
  onReset,
  onGoogleMaps,
  onFullscreen,
  onLiveGps,
}) {
  const [expanded, setExpanded] = useState(false)

  const buttonClass =
    'flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95'

  const activeButtonClass =
    'flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm transition hover:bg-teal-700 active:scale-95'

  // Collapsed state: show ONLY the expand button.
  if (!expanded) {
    return (
      <div className="absolute right-3 top-1/2 z-[1200] -translate-y-1/2">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={buttonClass}
          aria-label="Show map controls"
          title="Show map controls"
        >
          <Maximize2 size={20} strokeWidth={2} />
        </button>
      </div>
    )
  }

  // Expanded state: show the complete control bar.
  return (
    <div
      className="
        absolute
        right-3
        top-1/2
        z-[1200]
        flex
        -translate-y-1/2
        flex-col
        items-center
        gap-2
        rounded-[28px]
        bg-white/95
        p-2
        shadow-xl
        backdrop-blur
      "
    >
      {/* Compass / map orientation */}
      <button
        type="button"
        onClick={() => {
          if (typeof onLocate === 'function') {
            onLocate()
          }
        }}
        className={buttonClass}
        aria-label="Center on current location"
        title="Current location"
      >
        <Compass size={20} strokeWidth={2} />
      </button>

      {/* Current location */}
      <button
        type="button"
        onClick={() => {
          if (typeof onLiveGps === 'function') {
            onLiveGps()
          } else if (typeof onLocate === 'function') {
            onLocate()
          }
        }}
        className={activeButtonClass}
        aria-label="Locate me"
        title="Locate me"
      >
        <LocateFixed size={20} strokeWidth={2} />
      </button>

      {/* Google Maps */}
      <button
        type="button"
        onClick={() => {
          if (typeof onGoogleMaps === 'function') {
            onGoogleMaps()
          }
        }}
        className={buttonClass}
        aria-label="Open in Google Maps"
        title="Open in Google Maps"
      >
        <MapPinned size={20} strokeWidth={2} />
      </button>

      {/* Reset map */}
      <button
        type="button"
        onClick={() => {
          if (typeof onReset === 'function') {
            onReset()
          }
        }}
        className={buttonClass}
        aria-label="Reset map"
        title="Reset map"
      >
        <RotateCcw size={20} strokeWidth={2} />
      </button>

      {/* Navigation / route */}
      <button
        type="button"
        onClick={() => {
          if (typeof onNavigate === 'function') {
            onNavigate()
          }
        }}
        className={buttonClass}
        aria-label="Start navigation"
        title="Start navigation"
      >
        <Radio size={20} strokeWidth={2} />
      </button>

      {/* Fullscreen */}
      <button
        type="button"
        onClick={() => {
          if (typeof onFullscreen === 'function') {
            onFullscreen()
          }
        }}
        className={buttonClass}
        aria-label="Fullscreen map"
        title="Fullscreen map"
      >
        <Maximize2 size={20} strokeWidth={2} />
      </button>

      {/* Collapse controls */}
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95"
        aria-label="Hide map controls"
        title="Hide map controls"
      >
        <Minimize2 size={18} strokeWidth={2} />
      </button>
    </div>
  )
}
