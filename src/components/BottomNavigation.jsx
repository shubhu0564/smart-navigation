import { Link } from 'react-router-dom'
import { Home, Navigation, Map, Landmark, Settings } from 'lucide-react'

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/navigation', icon: Navigation, label: 'Nav' },
  { to: '/nearby', icon: Map, label: 'Places' },
  { to: '/landmark', icon: Landmark, label: 'Landmarks' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white/85 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {items.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-600">
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
