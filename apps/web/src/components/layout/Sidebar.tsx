'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Dumbbell, BookOpen, CreditCard, Bell,
  Calendar, QrCode, Scale, BarChart3, Settings, LogOut, X, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Alumnos', href: '/members', icon: Users },
  { label: 'Rutinas', href: '/routines', icon: Dumbbell },
  { label: 'Ejercicios', href: '/exercises', icon: BookOpen },
  { label: 'Pagos', href: '/payments', icon: CreditCard },
  { label: 'Horarios', href: '/schedules', icon: Calendar },
  { label: 'Asistencia', href: '/attendance', icon: QrCode },
  { label: 'Nutrición', href: '/nutrition', icon: Scale },
  { label: 'Reportes', href: '/reports', icon: BarChart3 },
  { label: 'Notificaciones', href: '/notifications', icon: Bell },
  { label: 'Administración', href: '/admin', icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    router.push('/login')
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-dark-900 border-r border-slate-700/50 z-50 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gradient">GymSaaS</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  active
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50',
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-primary-400' : 'text-slate-500 group-hover:text-white')} />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 mb-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
