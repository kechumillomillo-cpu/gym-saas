'use client'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#e94560', '#3b82f6', '#f59e0b', '#10b981']

export default function ReportsPage() {
  const now = new Date()

  const { data: billing } = useQuery({
    queryKey: ['billing', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => reportsApi.billing(now.getFullYear(), now.getMonth() + 1).then(r => r.data),
  })

  const { data: members } = useQuery({
    queryKey: ['member-report'],
    queryFn: () => reportsApi.members().then(r => r.data),
  })

  const { data: retention } = useQuery({
    queryKey: ['retention'],
    queryFn: () => reportsApi.retention().then(r => r.data),
  })

  const { data: attendance } = useQuery({
    queryKey: ['attendance-report'],
    queryFn: () => reportsApi.attendance(30).then(r => r.data),
  })

  const memberPieData = members ? [
    { name: 'Activos', value: members.active },
    { name: 'Inactivos', value: members.inactive },
    { name: 'Suspendidos', value: members.suspended },
    { name: 'Pendientes', value: members.pending },
  ] : []

  const billingByMethod = billing ? Object.entries(billing.byMethod || {}).map(([method, amount]) => ({
    name: { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', MERCADO_PAGO: 'MP' }[method] || method,
    amount: Number(amount),
  })) : []

  const attendanceByDay = attendance ? Object.entries(attendance.byDay || {}).slice(-14).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    count,
  })) : []

  return (
    <div className="space-y-6">
      {/* Billing */}
      <div className="card">
        <h3 className="font-semibold mb-4">Facturación del mes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-400">Total cobrado</p>
            <p className="text-2xl font-bold text-primary-400">{formatCurrency(billing?.total || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Cantidad de pagos</p>
            <p className="text-2xl font-bold">{billing?.payments?.length || 0}</p>
          </div>
        </div>
        {billingByMethod.length > 0 && (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={billingByMethod}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} formatter={(v: any) => [formatCurrency(v)]} />
              <Bar dataKey="amount" fill="#e94560" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members pie */}
        <div className="card">
          <h3 className="font-semibold mb-4">Estado de alumnos</h3>
          {memberPieData.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={memberPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {memberPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {memberPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-slate-400">{d.name}: <strong className="text-white">{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Retention */}
        {retention && (
          <div className="card">
            <h3 className="font-semibold mb-4">Retención de alumnos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Activos totales</p>
                <p className="font-semibold">{retention.totalActive}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Nuevos este mes</p>
                <p className="font-semibold text-green-400">+{retention.newThisMonth}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Tasa de retención</p>
                <p className="font-semibold text-primary-400">{retention.retentionRate}%</p>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-primary-500 rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(retention.retentionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance chart */}
      {attendanceByDay.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Asistencia últimos 14 días</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
