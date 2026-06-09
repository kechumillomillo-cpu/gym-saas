'use client'
import { useQuery } from '@tanstack/react-query'
import { authApi, routinesApi, paymentsApi, schedulesApi, adminApi } from '@/lib/api'
import { formatDate, formatCurrency, getDaysUntil, statusColor, statusLabel, cn, getInitials } from '@/lib/utils'
import { Dumbbell, CreditCard, Calendar, AlertTriangle, Bell, ChevronRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AppHome() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => authApi.me().then(r => r.data) })
  const { data: announcements } = useQuery({ queryKey: ['announcements'], queryFn: () => adminApi.getAnnouncements().then(r => r.data) })

  const member = me?.member
  const memberId = member?.id

  const { data: activeRoutine } = useQuery({
    queryKey: ['my-routine', memberId],
    queryFn: () => routinesApi.list().then(() => null),
    enabled: false,
  })

  const { data: myPayments } = useQuery({
    queryKey: ['my-payments', memberId],
    queryFn: () => paymentsApi.list({ memberId, limit: 3 }).then(r => r.data),
    enabled: !!memberId,
  })

  const latestPayment = myPayments?.data?.[0]
  const memberName = member ? `${member.firstName} ${member.lastName}` : me?.email || ''

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Welcome */}
      <div className="card bg-gradient-to-br from-primary-500/20 to-rose-500/10 border-primary-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
            {member ? getInitials(member.firstName, member.lastName) : '?'}
          </div>
          <div>
            <p className="font-semibold text-lg">¡Hola, {member?.firstName || 'alumno'}! 💪</p>
            <p className="text-sm text-slate-400">Bienvenido a tu portal</p>
          </div>
        </div>
      </div>

      {/* Quick status cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/app/routine" className="card hover:border-primary-500/40 transition-all">
          <Dumbbell className="w-6 h-6 text-primary-400 mb-2" />
          <p className="text-sm font-medium">Mi rutina</p>
          <p className="text-xs text-slate-400 mt-0.5">Ver ejercicios</p>
          <ChevronRight className="w-4 h-4 text-slate-600 mt-1" />
        </Link>

        <Link href="/app/payments" className="card hover:border-primary-500/40 transition-all">
          <CreditCard className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-sm font-medium">Mis pagos</p>
          {latestPayment ? (
            <span className={cn('text-xs badge mt-1', statusColor(latestPayment.status))}>
              {statusLabel(latestPayment.status)}
            </span>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">Ver estado</p>
          )}
        </Link>

        <Link href="/app/schedule" className="card hover:border-primary-500/40 transition-all">
          <Calendar className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-sm font-medium">Horarios</p>
          <p className="text-xs text-slate-400 mt-0.5">Reservar turno</p>
          <ChevronRight className="w-4 h-4 text-slate-600 mt-1" />
        </Link>

        <div className="card">
          <CheckCircle className="w-6 h-6 text-slate-400 mb-2" />
          <p className="text-sm font-medium">Asistencia</p>
          <p className="text-xs text-slate-400 mt-0.5">Presentá tu QR</p>
        </div>
      </div>

      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2 text-sm text-slate-300">
            <Bell className="w-4 h-4" />
            Novedades del gimnasio
          </h2>
          {announcements.slice(0, 3).map((a: any) => (
            <div key={a.id} className="card">
              <h3 className="font-medium text-sm">{a.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{a.body}</p>
              <p className="text-xs text-slate-600 mt-2">{formatDate(a.publishedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
