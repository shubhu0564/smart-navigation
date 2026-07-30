import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 py-6 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© 2026 Smart Navigation. Professional navigation experience.</p>
        <div className="flex gap-4">
          <Link to="/about" className="hover:text-teal-600">About</Link>
          <Link to="/contact" className="hover:text-teal-600">Contact</Link>
          <Link to="/admin" className="hover:text-teal-600">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
