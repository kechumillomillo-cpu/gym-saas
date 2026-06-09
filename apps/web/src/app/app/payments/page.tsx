'use client'
import { useQuery } from '@tanstack/react-query'
import { authApi, paymentsApi } from '@/lib/api'
import { formatCurrency, formatDate, statusColor, statusLabel, cn } from '@/lib/utils'
import { CreditCard, CheckCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react'

export default function MyPaymentsPage() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => authApi.me().then(r => r.data) })
  const memberId = me?.member?.id

  const { data: payments, isLoading } = useQuery({
    queryKey: ['my-payments', memberId],
    queryFn: () => paymentsApi.list({ memberId, limit: 20 }).then(r => r.data),
    enabled: !!memberId,
  })

  const latest = payments?.data?.[0]
  const isActive = latest?.status === 'PAID'

  const handlePayWithMP = async (payment: any) => {
    if (!memberId) return
    try {
      const { data } = await paymentsApi.createMpPreference({
        memberId,
        amount: Number(payment.amount),
        description: payment.plan?.name || 'Cuota mensual',
        backUrl: window.location.origin + '/app/payments',
      })
      window.location.href = data.initPoint
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) return <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="card animate-pulse h-20"/>)}</div>

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {latest && (
        <div className={cn('card border', isActive ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5')}>
          <div className="flex items-center gap-3">
            {isActive
              ? <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
              : <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />}
            <div>
              <p className="font-semibold">{isActive ? '✅ Cuota al día' : '⚠️ Cuota vencida o pendiente'}</p>
              {latest.periodEnd && (
                <p className="text-sm text-slate-400">Vence: {formatDate(latest.periodEnd)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <h2 className="font-semibold text-sm text-slate-300 flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Historial de pagos
      </h2>

      <div className="space-y-3">
        {payments?.data?.map((p: any) => (
          <div key={p.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{formatCurrency(Number(p.amount))}</span>
                  <span className={cn('badge', statusColor(p.status))}>{statusLabel(p.status)}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{p.plan?.name || 'Pago manual'}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {p.paidAt ? `Pagado ${formatDate(p.paidAt)}` : p.dueDate ? `Vence ${formatDate(p.dueDate)}` : '—'}
                  </span>
                  <span>{statusLabel(p.method)}</span>
                </div>
              </div>
              {(p.status === 'PENDING' || p.status === 'OVERDUE') && (
                <button
                  onClick={() => handlePayWithMP(p)}
                  className="btn-primary text-xs py-2 px-3 flex items-center gap-1 ml-3 flex-shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  Pagar
                </button>
              )}
            </div>
          </div>
        ))}
        {(!payments?.data || payments.data.length === 0) && (
          <div className="text-center py-12 text-slate-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Sin pagos registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}
