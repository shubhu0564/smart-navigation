import { Link } from 'react-router-dom'
import emblem from '../assets/Emblem_of_Mumbai.png'

export default function Navbar() {
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
              Gulmohar JVPD Scheme, K/West Ward - 67
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-teal-600/20 bg-teal-600/10 px-3 py-2 text-sm font-semibold text-teal-700 shadow-sm">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
          Live GIS Routing
        </div>
      </div>
    </header>
  )
}
