'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/lib/api'
import { formatCurrency, formatDate, statusColor, statusLabel, cn } from '@/lib/utils'
import { Plus, CheckCircle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { PaymentForm } from '@/components/payments/PaymentForm'

const statusOpts = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'PAID', label: 'Pagados' },
  { value: 'OVERDUE', label: 'Vencidos' },
]

export default function PaymentsPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['payments', { status, page }],
    queryFn: () => paymentsApi.list({ status, page, limit: 20 }).then((r) => r.data),
  })

  const { data: revenue } = useQuery({
    queryKey: ['month-revenue'],
    queryFn: () => paymentsApi.monthRevenue().then((r) => r.data),
  })

  const markPaid = async (id: string) => {
    try {
      await paymentsApi.markPaid(id)
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['month-revenue'] })
      toast.success('Pago registrado')
    } catch { toast.error('Error al actualizar') }
  }

  return (
    <div className="space-y-4">
      {revenue && (
        <div className="card bg-gradient-to-r from-primary-500/20 to-rose-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Ingresos del mes</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(revenue.total)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          {statusOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Registrar pago
        </button>
      </div>

      {showForm && (
        <PaymentForm
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['payments'] }); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="p-4 text-center text-slate-400">Cargando...</div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {data?.data?.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{p.member?.firstName} {p.member?.lastName}</p>
                  <p className="text-sm text-slate-400">{p.plan?.name || 'Pago manual'} · {p.method && statusLabel(p.method)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.paidAt ? `Pagado ${formatDate(p.paidAt)}` : p.dueDate ? `Vence ${formatDate(p.dueDate)}` : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-semibold">{formatCurrency(Number(p.amount))}</span>
                  <span className={cn('badge', statusColor(p.status))}>{statusLabel(p.status)}</span>
                  {(p.status === 'PENDING' || p.status === 'OVERDUE') && (
                    <button onClick={() => markPaid(p.id)} className="text-green-400 hover:text-green-300" title="Marcar pagado">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {data?.data?.length === 0 && (
              <div className="text-center py-12 text-slate-500">No hay pagos</div>
            )}
          </div>
        )}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex justify-end gap-2 p-4 border-t border-slate-700/30">
            <button className="btn-secondary py-1.5 px-3 text-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <button className="btn-secondary py-1.5 px-3 text-sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        )}
      </div>
    </div>
  )
}
