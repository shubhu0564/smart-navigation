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

        <div className="flex items-center gap-2">
          <label htmlFor="language-select" className="sr-only">Language</label>
          <select
            id="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 shadow-sm outline-none transition hover:border-slate-300 sm:text-sm"
            style={{ height: '38px' }}
          >
            <option value="en">English</option>
            <option value="mr">Marathi</option>
          </select>
          <a
            href="https://sapthakalaa.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm transition hover:shadow-md"
            style={{ height: '40px', width: '40px', cursor: 'pointer' }}
          >
            <img
              src="/image.png"
              alt="Sapthakalaa logo"
              className="h-full w-full rounded-full object-cover"
            />
          </a>
        </div>
      </div>
    </header>
  )
}
