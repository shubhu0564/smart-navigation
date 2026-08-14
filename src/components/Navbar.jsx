import { Link } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import emblem from '../assets/Emblem_of_Mumbai.png'

export default function Navbar() {
  const { language, setLanguage } = useNavigation()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      
      <div
        className="
          mx-auto flex w-full max-w-[1440px]
          items-center justify-between
          px-4 py-3
          sm:px-6 sm:py-3
          lg:px-8
          xl:px-10
          2xl:px-12
        "
      >

        {/* =========================
            BMC LOGO + INFORMATION
        ========================== */}
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
        >
          <img
            src={emblem}
            alt="Brihanmumbai Municipal Corporation"
            className="
              h-10 w-10
              shrink-0
              object-contain
              sm:h-12 sm:w-12
            "
          />

          <div className="min-w-0">
            <p
              className="
                text-[13px]
                font-bold
                leading-[1.1]
                tracking-tight
                text-slate-900
                sm:text-[16px]
                dark:text-slate-100
              "
            >
              <span className="block">
                Brihanmumbai Municipal
              </span>

              <span className="block">
                Corporation
              </span>
            </p>

            <p
              className="
                mt-1
                text-[10px]
                leading-tight
                text-slate-500
                sm:text-[12px]
                dark:text-slate-400
              "
            >
              K/West Ward – 67
            </p>
          </div>
        </Link>


        {/* =========================
            RIGHT SIDE
        ========================== */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* LANGUAGE SELECTOR */}
          <label
            htmlFor="language-select"
            className="sr-only"
          >
            Language
          </label>

          <select
            id="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="
              h-8
              w-[58px]
              rounded-full
              border
              border-slate-200
              bg-white
              px-2
              text-[11px]
              font-semibold
              text-slate-700
              shadow-sm
              outline-none

              focus:border-teal-500
              focus:ring-1
              focus:ring-teal-200

              sm:h-9
              sm:w-[70px]
              sm:text-xs
            "
          >
            <option value="en">
              Eng
            </option>

            <option value="mr">
              म
            </option>
          </select>


          {/* =========================
              SAPTHAKALAA LOGO
          ========================== */}
          <a
            href="https://sapthakalaa.co.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sapthakalaa"
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
              p-1.5
              shadow-sm
              transition
              duration-200
              hover:scale-105

              sm:h-12
              sm:w-12
              sm:p-2
            "
          >
            <img
              src="/images/guided-by/image.png"
              alt="Sapthakalaa logo"
              className="
                h-full
                w-full
                object-contain
              "
            />
          </a>

        </div>
      </div>
    </header>
  )
}