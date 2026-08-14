import { Link } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import emblem from '../assets/Emblem_of_Mumbai.png'

export default function Navbar() {
  const { language, setLanguage } = useNavigation()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-1 px-2 py-1 sm:flex sm:items-center sm:justify-between sm:gap-2 sm:px-6 sm:py-2 lg:px-8 xl:px-10 2xl:px-12 md:gap-2 md:px-3 md:py-1.5">

        {/* BMC LOGO + TITLE */}
        <Link
          to="/"
          className="flex min-w-0 items-center gap-1.5 sm:gap-3 md:gap-2"
        >
          <img
            src={emblem}
            alt="Brihanmumbai Municipal Corporation"
            className="h-6 w-6 shrink-0 object-contain sm:h-11 sm:w-11 md:h-8 md:w-8"
          />

          <div className="navbar-title min-w-0 max-w-[160px] sm:max-w-none md:max-w-none">
            <p className="text-[10px] font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-xl md:text-sm dark:text-slate-100">
              <span className="block sm:inline md:inline">
                Brihanmumbai Municipal
              </span>
              <span className="block sm:inline sm:ml-1 md:inline md:ml-1">
                Corporation
              </span>
            </p>

            <p className="mt-0.5 text-[8px] leading-tight text-slate-500 sm:mt-1 sm:text-base md:text-xs dark:text-slate-400">
              K/West Ward – 67
            </p>
          </div>
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3 md:gap-2">

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
            className="language-select-mobile h-6 w-[60px] rounded-full border border-slate-200 bg-white px-1.5 text-[9px] font-medium text-slate-700 shadow-sm outline-none sm:h-9 sm:min-w-[90px] sm:w-auto sm:px-3 sm:text-sm md:h-8 md:min-w-[75px] md:px-2 md:text-xs"
          >
            <option value="en">Eng</option>
            <option value="mr">म</option>
          </select>

          <a
            href="https://sapthakalaa.co.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sapthakalaa"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-1 shadow-sm sm:h-11 sm:w-11 sm:p-2 md:h-8 md:w-8 md:p-1.5"
          >
            <img
              src="/images/guided-by/image.png"
              alt="Sapthakalaa logo"
              className="h-full w-full object-contain"
            />
          </a>

        </div>
      </div>
    </header>
  )
}