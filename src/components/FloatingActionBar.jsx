import React from 'react'

import {
  Compass,
  Crosshair,
  MapPin,
  RotateCcw,
  Radio,
  Maximize2,
  Minimize2,
} from 'lucide-react'

export default function FloatingActionBar({
  onLocate,
  onNavigate,
  onReset,
  onGoogleMaps,
  onFullscreen,
  onLiveGps,
  isFullscreen = false,
}) {
  const handleClick = (event, callback) => {
    event.preventDefault()
    event.stopPropagation()

    if (typeof callback === 'function') {
      callback()
    }
  }

  return (
    <div
      className="
        pointer-events-none
        absolute
        bottom-3
        right-3
        z-[2200]
      "
    >
      <div
        className="
          pointer-events-auto
          flex
          items-center
          gap-1
          rounded-full
          border
          border-slate-200
          bg-white/95
          p-1.5
          shadow-[0_8px_30px_rgba(15,23,42,0.18)]
          backdrop-blur-md
          max-w-[calc(100vw-16px)]
        "
      >

        {/* =========================================
            NORMAL MAP
            ONLY FULLSCREEN BUTTON
           ========================================= */}

        {!isFullscreen && (
          <button
            type="button"
            title="Fullscreen"
            aria-label="Fullscreen"
            onClick={(event) =>
              handleClick(event, onFullscreen)
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-teal-200
              bg-white
              text-slate-600
              shadow-sm
              transition-all
              duration-150
              hover:bg-slate-50
              hover:text-teal-600
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-teal-500/30
            "
          >
            <Maximize2
              size={18}
              strokeWidth={2}
            />
          </button>
        )}


        {/* =========================================
            FULLSCREEN / ENHANCED MAP
            ALL BUTTONS
           ========================================= */}

        {isFullscreen && (
          <>
            {/* GET DIRECTION */}
            <button
              type="button"
              title="Get Direction"
              aria-label="Get Direction"
              onClick={(event) =>
                handleClick(event, onNavigate)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-sm
                transition-all
                duration-150
                hover:bg-slate-50
                hover:text-teal-600
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-teal-500/30
              "
            >
              <Compass
                size={18}
                strokeWidth={2}
              />
            </button>


            {/* MY LOCATION */}
            <button
              type="button"
              title="My Location"
              aria-label="My Location"
              onClick={(event) =>
                handleClick(event, onLocate)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-teal-200
                bg-teal-50
                text-teal-600
                shadow-sm
                transition-all
                duration-150
                hover:bg-teal-100
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-teal-500/30
              "
            >
              <Crosshair
                size={18}
                strokeWidth={2}
              />
            </button>


            {/* GOOGLE MAPS */}
            <button
              type="button"
              title="Open Google Maps"
              aria-label="Open Google Maps"
              onClick={(event) =>
                handleClick(event, onGoogleMaps)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-sm
                transition-all
                duration-150
                hover:bg-slate-50
                hover:text-teal-600
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-teal-500/30
              "
            >
              <MapPin
                size={18}
                strokeWidth={2}
              />
            </button>


            {/* RESET MAP */}
            <button
              type="button"
              title="Reset Map"
              aria-label="Reset Map"
              onClick={(event) =>
                handleClick(event, onReset)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-sm
                transition-all
                duration-150
                hover:bg-slate-50
                hover:text-teal-600
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-teal-500/30
              "
            >
              <RotateCcw
                size={18}
                strokeWidth={2}
              />
            </button>


            {/* LIVE GPS */}
            <button
              type="button"
              title="Live GPS"
              aria-label="Live GPS"
              onClick={(event) =>
                handleClick(event, onLiveGps)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-sm
                transition-all
                duration-150
                hover:bg-slate-50
                hover:text-teal-600
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-teal-500/30
              "
            >
              <Radio
                size={18}
                strokeWidth={2}
              />
            </button>


            {/* EXIT FULLSCREEN */}
            <button
              type="button"
              title="Exit Fullscreen"
              aria-label="Exit Fullscreen"
              onClick={(event) =>
                handleClick(event, onFullscreen)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-teal-200
                bg-white
                text-slate-600
                shadow-sm
                transition-all
                duration-150
                hover:bg-slate-50
                hover:text-teal-600
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-teal-500/30
              "
            >
              <Minimize2
                size={18}
                strokeWidth={2}
              />
            </button>
          </>
        )}

      </div>
    </div>
  )
}