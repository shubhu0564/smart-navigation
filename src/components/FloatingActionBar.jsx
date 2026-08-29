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
  const actions = [
    {
      id: 'navigate',
      label: 'Get Direction',
      icon: Compass,
      onClick: onNavigate,
    },

    {
      id: 'location',
      label: 'My Location',
      icon: Crosshair,
      onClick: onLocate,
    },

    {
      id: 'google',
      label: 'Open Google Maps',
      icon: MapPin,
      onClick: onGoogleMaps,
    },

    {
      id: 'reset',
      label: 'Reset Map',
      icon: RotateCcw,
      onClick: onReset,
    },

    {
      id: 'gps',
      label: 'Live GPS',
      icon: Radio,
      onClick: onLiveGps,
    },
  ]

  const handleClick = (event, action) => {
    event.preventDefault()
    event.stopPropagation()

    if (typeof action.onClick === 'function') {
      action.onClick()
    }
  }

  return (
    <div
      className="
        pointer-events-none
        absolute
        bottom-3
        left-1/2
        z-[2200]
        -translate-x-1/2
      "
    >
      <div
        className="
          pointer-events-auto
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-slate-200
          bg-white/95
          p-2
          shadow-[0_8px_30px_rgba(15,23,42,0.18)]
          backdrop-blur-md
        "
      >

        {/* =========================================
            GET DIRECTION
           ========================================= */}

        <button
          type="button"
          title="Get Direction"
          aria-label="Get Direction"
          onClick={(event) =>
            handleClick(event, actions[0])
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
          <Compass
            size={19}
            strokeWidth={2}
          />
        </button>


        {/* =========================================
            MY LOCATION
           ========================================= */}

        <button
          type="button"
          title="My Location"
          aria-label="My Location"
          onClick={(event) =>
            handleClick(event, actions[1])
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


        {/* =========================================
            GOOGLE MAPS
           ========================================= */}

        <button
          type="button"
          title="Open Google Maps"
          aria-label="Open Google Maps"
          onClick={(event) =>
            handleClick(event, actions[2])
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


        {/* =========================================
            RESET MAP
           ========================================= */}

        <button
          type="button"
          title="Reset Map"
          aria-label="Reset Map"
          onClick={(event) =>
            handleClick(event, actions[3])
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


        {/* =========================================
            LIVE GPS
           ========================================= */}

        <button
          type="button"
          title="Live GPS"
          aria-label="Live GPS"
          onClick={(event) =>
            handleClick(event, actions[4])
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
          <Radio
            size={19}
            strokeWidth={2}
          />
        </button>


        {/* =========================================
            FULLSCREEN
           ========================================= */}

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
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()

            if (
              typeof onFullscreen ===
              'function'
            ) {
              onFullscreen()
            }
          }}
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