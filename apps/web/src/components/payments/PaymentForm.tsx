'use client'
import { useQuery } from '@tanstack/react-query'
import { membersApi, paymentsApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export function PaymentForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: () => paymentsApi.plans().then(r => r.data) })
  const { data: membersData } = useQuery({ queryKey: ['members-mini'], queryFn: () => membersApi.list({ limit: 200 }).then(r => r.data) })

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: { memberId: '', planId: '', amount: '', method: 'CASH', notes: '' }
  })

  const selectedPlan = watch('planId')

  const onSubmit = async (data: any) => {
    try {
      const plan = plans?.find((p: any) => p.id === data.planId)
      await paymentsApi.create({ ...data, amount: data.amount || plan?.amount })
      toast.success('Pago registrado')
      onSuccess()
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error') }
  }

  return (
    <div className="card border border-primary-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Registrar pago</h3>
        <button onClick={onCancel}><X className="w-5 h-5 text-slate-400" /></button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Alumno *</label>
          <select {...register('memberId', { required: true })} className="input">
            <option value="">Seleccioná un alumno</option>
            {membersData?.data?.map((m: any) => (
              <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Plan</label>
          <select {...register('planId')} className="input" onChange={(e) => {
            setValue('planId', e.target.value)
            const p = plans?.find((pl: any) => pl.id === e.target.value)
            if (p) setValue('amount', p.amount)
          }}>
            <option value="">Sin plan / Monto personalizado</option>
            {plans?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} — ${p.amount}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Monto *</label>
          <input {...register('amount', { required: true })} type="number" className="input" placeholder="15000" />
        </div>
        <div>
          <label className="label">Método de pago</label>
          <select {...register('method')} className="input">
            <option value="CASH">Efectivo</option>
            <option value="CARD">Tarjeta</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="MERCADO_PAGO">Mercado Pago</option>
          </select>
        </div>
        <div>
          <label className="label">Notas</label>
          <input {...register('notes')} className="input" placeholder="Observaciones..." />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Registrar pago'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
