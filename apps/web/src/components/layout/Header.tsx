'use client'
import { Menu, Bell, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Alumnos',
  '/routines': 'Rutinas',
  '/exercises': 'Biblioteca de ejercicios',
  '/payments': 'Pagos',
  '/schedules': 'Horarios',
  '/attendance': 'Asistencia',
  '/nutrition': 'Nutrición',
  '/reports': 'Reportes',
  '/notifications': 'Notificaciones',
  '/admin': 'Administración',
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const base = '/' + pathname.split('/')[1]
  const title = titles[base] || 'GymSaaS'

  return (
    <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white p-1"
      >
        <Menu className="w-6 h-6" />
      </button>

      <h1 className="text-lg font-semibold text-white flex-1">{title}</h1>

      <div className="flex items-center gap-2">
        <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
