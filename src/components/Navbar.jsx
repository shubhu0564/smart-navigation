import { Link } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import emblem from '../assets/Emblem_of_Mumbai.png'

export default function Navbar() {
  const { language, setLanguage } = useNavigation()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-4">
          <img
            src={emblem}
            alt="Mumbai emblem logo"
            className="h-14 w-14 rounded-full border border-slate-200 object-cover shadow-sm dark:border-slate-700"
          />
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
              Brihanmumbai Municipal Corporation
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              K/West Ward – 67
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <label htmlFor="language-select" className="sr-only">Language</label>
          <select
            id="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-300"
          >
            <option value="en">English</option>
            <option value="mr">Marathi</option>
          </select>
          <a
            href="https://sapthakalaa.co.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white p-2 shadow-sm transition hover:scale-[1.02]"
          >
            <img
              src="/LOGO DESIGN for print_png.png"
              alt="Sapthakalaa logo"
              className="h-full w-full object-contain"
            />
          </a>
        </div>
      </div>
    </header>
  )
}
