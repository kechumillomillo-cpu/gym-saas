'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, membersApi } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { Bell, Send, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const statusIcon: any = { SENT: CheckCircle, FAILED: XCircle, PENDING: Clock, CANCELLED: XCircle }
const statusColor: any = { SENT: 'text-green-400', FAILED: 'text-red-400', PENDING: 'text-yellow-400', CANCELLED: 'text-slate-400' }

export default function NotificationsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', channels: ['WHATSAPP', 'EMAIL'], memberId: '' })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 30 }).then(r => r.data),
  })

  const { data: membersData } = useQuery({
    queryKey: ['members-mini'],
    queryFn: () => membersApi.list({ limit: 200 }).then(r => r.data),
  })

  const handleSend = async () => {
    try {
      await notificationsApi.sendCustom({ ...form, memberId: form.memberId || undefined })
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notificación enviada')
      setShowForm(false)
    } catch { toast.error('Error al enviar') }
  }

  const toggleChannel = (ch: string) => {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch],
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Send className="w-4 h-4" />
          Enviar notificación
        </button>
      </div>

      {showForm && (
        <div className="card border border-primary-500/30">
          <h3 className="font-semibold mb-4">Nueva notificación</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Alumno (vacío = todos)</label>
              <select className="input" value={form.memberId} onChange={(e) => setForm(f => ({ ...f, memberId: e.target.value }))}>
                <option value="">Todos los alumnos activos</option>
                {membersData?.data?.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Título *</label>
              <input className="input" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Novedad del gimnasio" />
            </div>
            <div>
              <label className="label">Mensaje *</label>
              <textarea className="input" rows={3} value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Escribí el mensaje..." />
            </div>
            <div>
              <label className="label">Canales</label>
              <div className="flex gap-3">
                {['WHATSAPP', 'EMAIL', 'PUSH'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={cn('px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', form.channels.includes(ch) ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : 'border-slate-600 text-slate-400 hover:border-slate-500')}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSend} disabled={!form.title || !form.body} className="btn-primary flex-1">Enviar</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <p className="p-4 text-slate-400">Cargando...</p>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {data?.data?.map((n: any) => {
              const Icon = statusIcon[n.status] || Bell
              return (
                <div key={n.id} className="flex items-start gap-4 p-4">
                  <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', statusColor[n.status] || 'text-slate-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5 truncate">{n.body}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{n.channel}</span>
                      <span>·</span>
                      <span>{formatDate(n.createdAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {data?.data?.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Sin notificaciones</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
