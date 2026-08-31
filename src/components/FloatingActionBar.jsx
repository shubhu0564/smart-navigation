import React from 'react'

import {
  Crosshair,
  MapPin,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react'

export default function FloatingActionBar({
  onLocate,
  onReset,
  onGoogleMaps,
  onFullscreen,
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
      className={`
        pointer-events-none
        absolute
        z-[2200]
        ${
          isFullscreen
            ? 'right-4 top-1/2 -translate-y-1/2'
            : 'bottom-3 right-3'
        }
      `}
    >
      <div
        className={`
          pointer-events-auto
          rounded-full
          border
          border-slate-200
          bg-white/95
          p-2
          shadow-[0_8px_30px_rgba(15,23,42,0.18)]
          backdrop-blur-md
          ${
            isFullscreen
              ? 'flex flex-col items-center gap-2'
              : 'flex items-center'
          }
        `}
      >

        {/* =================================================
            FULLSCREEN MODE ONLY
            MY LOCATION
           ================================================= */}

        {isFullscreen && (
          <button
            type="button"
            title="My Location"
            aria-label="My Location"
            onClick={(event) =>
              handleClick(event, onLocate)
            }
            className="
              flex
              h-11
              w-11
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
              size={19}
              strokeWidth={2}
            />
          </button>
        )}

        {/* =================================================
            FULLSCREEN MODE ONLY
            GOOGLE MAPS
           ================================================= */}

        {isFullscreen && (
          <button
            type="button"
            title="Open Google Maps"
            aria-label="Open Google Maps"
            onClick={(event) =>
              handleClick(event, onGoogleMaps)
            }
            className="
              flex
              h-11
              w-11
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
              size={19}
              strokeWidth={2}
            />
          </button>
        )}

        {/* =================================================
            FULLSCREEN MODE ONLY
            RESET MAP
           ================================================= */}

        {isFullscreen && (
          <button
            type="button"
            title="Reset Map"
            aria-label="Reset Map"
            onClick={(event) =>
              handleClick(event, onReset)
            }
            className="
              flex
              h-11
              w-11
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
              size={19}
              strokeWidth={2}
            />
          </button>
        )}

        {/* =================================================
            FULLSCREEN / ENHANCE
            ALWAYS VISIBLE
           ================================================= */}

        <button
          type="button"
          title={
            isFullscreen
              ? 'Exit Fullscreen'
              : 'Enhance Map'
          }
          aria-label={
            isFullscreen
              ? 'Exit Fullscreen'
              : 'Enhance Map'
          }
          onClick={(event) =>
            handleClick(event, onFullscreen)
          }
          className="
            flex
            h-11
            w-11
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
            hover:bg-teal-50
            hover:text-teal-600
            active:scale-95
            focus:outline-none
            focus:ring-2
            focus:ring-teal-500/30
          "
        >
          {isFullscreen ? (
            <Minimize2
              size={19}
              strokeWidth={2}
            />
          ) : (
            <Maximize2
              size={19}
              strokeWidth={2}
            />
          )}
        </button>

      </div>
    </div>
  )
}