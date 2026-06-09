'use client'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { formatCurrency, formatRelative, statusLabel } from '@/lib/utils'
import {
  Users, TrendingUp, CreditCard, AlertTriangle, Dumbbell, Activity, Calendar, UserPlus,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

function StatCard({ label, value, sub, icon: Icon, color = 'primary' }: any) {
  const colors: any = {
    primary: 'bg-primary-500/20 text-primary-400',
    green: 'bg-green-500/20 text-green-400',
    orange: 'bg-orange-500/20 text-orange-400',
    blue: 'bg-blue-500/20 text-blue-400',
    red: 'bg-red-500/20 text-red-400',
  }
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
  })

  const { data: chart } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => dashboardApi.revenueChart(6).then((r) => r.data),
  })

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.activity().then((r) => r.data),
  })

  const { data: expiries } = useQuery({
    queryKey: ['dashboard-expiries'],
    queryFn: () => dashboardApi.expiries().then((r) => r.data),
  })

  if (statsLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card h-24 animate-pulse bg-dark-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total alumnos" value={stats?.totalMembers ?? 0} icon={Users} color="blue" />
        <StatCard label="Activos" value={stats?.activeMembers ?? 0} sub={`${stats?.inactiveMembers ?? 0} inactivos`} icon={TrendingUp} color="green" />
        <StatCard label="Ingresos del mes" value={formatCurrency(stats?.monthlyRevenue ?? 0)} sub={`vs ${formatCurrency(stats?.revenueLastMonth ?? 0)} anterior`} icon={CreditCard} color="primary" />
        <StatCard label="Pagos pendientes" value={stats?.pendingPayments ?? 0} sub={`${stats?.overduePayments ?? 0} vencidos`} icon={AlertTriangle} color="orange" />
        <StatCard label="Rutinas por vencer" value={stats?.routinesExpiringSoon ?? 0} icon={Dumbbell} color="orange" />
        <StatCard label="Asistencia hoy" value={stats?.attendancesToday ?? 0} icon={Activity} color="green" />
        <StatCard label="Reservas hoy" value={stats?.reservationsToday ?? 0} icon={Calendar} color="blue" />
        <StatCard label="Nuevos este mes" value={stats?.newMembersThisMonth ?? 0} icon={UserPlus} color="primary" />
      </div>

      {/* Revenue chart */}
      {chart && (
        <div className="card">
          <h3 className="text-base font-semibold mb-4">Ingresos últimos 6 meses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e94560" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(v: any) => [formatCurrency(v), 'Ingresos']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#e94560" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming expiries */}
        {expiries && (
          <div className="card">
            <h3 className="text-base font-semibold mb-4">Próximos vencimientos</h3>
            <div className="space-y-2">
              {expiries.paymentsDue?.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-700/30">
                  <span className="text-sm text-slate-300">{p.member.firstName} {p.member.lastName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-orange-400">{formatCurrency(Number(p.amount))}</span>
                    <span className="text-xs text-slate-500">{formatRelative(p.dueDate)}</span>
                  </div>
                </div>
              ))}
              {(!expiries.paymentsDue || expiries.paymentsDue.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">Sin vencimientos próximos</p>
              )}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {activity && (
          <div className="card">
            <h3 className="text-base font-semibold mb-4">Actividad reciente</h3>
            <div className="space-y-2">
              {activity.recentPayments?.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-700/30">
                  <CreditCard className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{p.member.firstName} {p.member.lastName}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(Number(p.amount))} · {statusLabel(p.status)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
