'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getStoredTokens } from '@/lib/auth'
import {
  LayoutDashboard, Dumbbell, CreditCard, Calendar, UserCircle, LogOut, Dumbbell as GymIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const nav = [
  { href: '/app', label: 'Inicio', icon: LayoutDashboard },
  { href: '/app/routine', label: 'Mi rutina', icon: Dumbbell },
  { href: '/app/payments', label: 'Pagos', icon: CreditCard },
  { href: '/app/schedule', label: 'Horarios', icon: Calendar },
  { href: '/app/profile', label: 'Perfil', icon: UserCircle },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    const { accessToken } = getStoredTokens()
    if (!accessToken) router.replace('/login')
    const handleLogout = () => router.replace('/login')
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [router])

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-900/90 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <GymIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gradient flex-1">GymSaaS</span>
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 hidden sm:inline">{user.member?.firstName || user.email}</span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 p-1 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="px-4 py-4 max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-md border-t border-slate-700/50 flex z-40">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <Icon className={cn('w-5 h-5', active ? 'text-primary-400' : 'text-slate-500')} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
