import React from 'react'

import {
  Search,
  Crosshair,
  MapPin,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react'

export default function FloatingActionBar({
  onLocate,
  onSearch,
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
      className="
        pointer-events-none
        absolute
        bottom-4
        left-190
        z-[2200]
        -translate-x-1/2
      
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
          shadow-[0_6px_20px_rgba(15,23,42,0.18)]
          backdrop-blur-md
        "
      >

        {/* SEARCH — fullscreen only */}
        {isFullscreen && (
          <button
            type="button"
            title="Search"
            aria-label="Search"
            onClick={(event) =>
              handleClick(event, onSearch)
            }
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-600
              shadow-sm
              hover:bg-slate-50
              hover:text-teal-600
              active:scale-95
            "
          >
            <Search size={17} strokeWidth={2} />
          </button>
        )}

        {/* LOCATION */}
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
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-teal-200
              bg-teal-50
              text-teal-600
              shadow-sm
              hover:bg-teal-100
              active:scale-95
            "
          >
            <Crosshair size={17} strokeWidth={2} />
          </button>
        )}

        {/* GOOGLE MAPS */}
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
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-600
              shadow-sm
              hover:bg-slate-50
              hover:text-teal-600
              active:scale-95
            "
          >
            <MapPin size={17} strokeWidth={2} />
          </button>
        )}

        {/* RESET */}
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
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-600
              shadow-sm
              hover:bg-slate-50
              hover:text-teal-600
              active:scale-95
            "
          >
            <RotateCcw size={17} strokeWidth={2} />
          </button>
        )}

        {/* FULLSCREEN / EXIT */}
        <button
          type="button"
          title={
            isFullscreen
              ? 'Exit Fullscreen'
              : 'Fullscreen'
          }
          aria-label={
            isFullscreen
              ? 'Exit Fullscreen'
              : 'Fullscreen'
          }
          onClick={(event) =>
            handleClick(event, onFullscreen)
          }
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-teal-200
            bg-white
            text-slate-600
            shadow-sm
            hover:bg-slate-50
            hover:text-teal-600
            active:scale-95
          "
        >
          {isFullscreen ? (
            <Minimize2 size={17} strokeWidth={2} />
          ) : (
            <Maximize2 size={17} strokeWidth={2} />
          )}
        </button>

      </div>
    </div>
  )
}