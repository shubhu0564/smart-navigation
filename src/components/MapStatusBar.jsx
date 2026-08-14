import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  CloudSun,
  Clock3,
  Gauge,
  ThermometerSun,
} from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'
import { fetchGulmoharAreaStatus } from '../services/mapStatusService'

function StatusTile({ label, value, icon: Icon, darkMode }) {
  return (
    <div
      className={`
        rounded-[18px]
        border
        px-4
        py-4
        ${
          darkMode
            ? 'border-slate-700 bg-slate-900'
            : 'border-slate-200 bg-white'
        }
      `}
    >
      {/* LABEL */}
      <div
        className={`
          flex
          items-center
          gap-2
          ${
            darkMode
              ? 'text-slate-300'
              : 'text-slate-600'
          }
        `}
      >
        <Icon size={17} strokeWidth={2.2} />

        <span
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.16em]
          "
        >
          {label}
        </span>
      </div>

      {/* ACTUAL DATA VALUE */}
      <p
        className={`
          mt-2
          break-words
          text-[20px]
          font-extrabold
          leading-tight
          ${
            darkMode
              ? 'text-white'
              : 'text-slate-900'
          }
        `}
      >
        {value}
      </p>
    </div>
  )
}

export default function MapStatusBar() {
  const { language, darkMode } = useNavigation()

  const [expanded, setExpanded] = useState(false)

  const [now, setNow] = useState(
    () => new Date()
  )

  const [status, setStatus] = useState({
    aqi: 'Data unavailable',
    weatherCondition: 'Data unavailable',
    temperature: 'Data unavailable',
  })

  /*
   * ==========================================================
   * FETCH AREA STATUS
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * LIVE CLOCK
   * ==========================================================
   */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const timeLabel = useMemo(() => {
    return now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [now])

  /*
   * ==========================================================
   * MAIN UI
   * ==========================================================
   */

  return (
    <motion.button
      type="button"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      onClick={() =>
        setExpanded(
          (current) => !current
        )
      }
      className={`
        w-full
        rounded-[26px]
        border
        px-4
        py-4
        text-left
        shadow-sm
        transition

        ${
          darkMode
            ? 'border-slate-800 bg-slate-950 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }
      `}
      aria-expanded={expanded}
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        {/* TITLE */}
        <div className="min-w-0">
          <p
            className="
              text-sm
              font-bold
              uppercase
              tracking-[0.16em]
              text-teal-600
              dark:text-teal-300
            "
          >
            {getText(
              {
                en: 'Area status',
                mr: 'क्षेत्र स्थिती',
              },
              language
            )}
          </p>

          <p
            className={`
              mt-1
              text-xs
              ${
                darkMode
                  ? 'text-slate-300'
                  : 'text-slate-600'
              }
            `}
          >
            {getText(
              {
                en: 'Tap for AQI, weather and time',
                mr: 'AQI, हवामान आणि वेळ पाहण्यासाठी टॅप करा',
              },
              language
            )}
          </p>
        </div>

        {/* HEADER VALUES */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          {/* AQI */}
          <div
            className={`
              rounded-full
              px-3
              py-1.5
              text-xs
              font-extrabold

              ${
                darkMode
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-900'
              }
            `}
          >
            AQI {status.aqi}
          </div>

          {/* TEMPERATURE */}
          <div
            className={`
              rounded-full
              px-3
              py-1.5
              text-xs
              font-extrabold

              ${
                darkMode
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-900'
              }
            `}
          >
            {status.temperature}
          </div>

          {/* ARROW */}
          <ChevronDown
            className={`
              transition-transform
              ${
                expanded
                  ? 'rotate-180'
                  : ''
              }
              ${
                darkMode
                  ? 'text-white'
                  : 'text-slate-700'
              }
            `}
            size={18}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* ======================================================
          EXPANDED STATUS
          ====================================================== */}

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="overflow-hidden"
          >
            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              <StatusTile
                label="AQI"
                value={status.aqi}
                icon={Gauge}
                darkMode={darkMode}
              />

              <StatusTile
                label="Weather"
                value={status.weatherCondition}
                icon={CloudSun}
                darkMode={darkMode}
              />

              <StatusTile
                label="Temperature"
                value={status.temperature}
                icon={ThermometerSun}
                darkMode={darkMode}
              />

              <StatusTile
                label="Current time"
                value={timeLabel}
                icon={Clock3}
                darkMode={darkMode}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  )
}