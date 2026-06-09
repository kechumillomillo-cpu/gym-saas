'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { nutritionApi, membersApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Scale, TrendingUp, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function NutritionPage() {
  const [selectedMember, setSelectedMember] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ weight: '', height: '', waist: '', chest: '', hip: '', notes: '' })
  const qc = useQueryClient()

  const { data: membersData } = useQuery({
    queryKey: ['members-mini'],
    queryFn: () => membersApi.list({ limit: 200 }).then(r => r.data),
  })

  const { data: metrics } = useQuery({
    queryKey: ['metrics', selectedMember],
    queryFn: () => nutritionApi.getMetrics(selectedMember).then(r => r.data),
    enabled: !!selectedMember,
  })

  const handleSave = async () => {
    if (!selectedMember) return
    try {
      await nutritionApi.createMetric({ memberId: selectedMember, ...form })
      qc.invalidateQueries({ queryKey: ['metrics', selectedMember] })
      toast.success('Medidas guardadas')
      setShowForm(false)
    } catch { toast.error('Error al guardar') }
  }

  const chartData = metrics?.slice(0, 10).reverse().map((m: any) => ({
    date: formatDate(m.recordedAt, { day: '2-digit', month: '2-digit' }),
    peso: m.weight,
    imc: m.bmi,
  })) || []

  const latest = metrics?.[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="input flex-1"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">Seleccioná un alumno</option>
          {membersData?.data?.map((m: any) => (
            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
          ))}
        </select>
        {selectedMember && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva medición
          </button>
        )}
      </div>

      {showForm && selectedMember && (
        <div className="card border border-primary-500/30">
          <h3 className="font-semibold mb-4">Registrar medidas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { key: 'weight', label: 'Peso (kg)' },
              { key: 'height', label: 'Altura (cm)' },
              { key: 'waist', label: 'Cintura (cm)' },
              { key: 'chest', label: 'Pecho (cm)' },
              { key: 'hip', label: 'Cadera (cm)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type="number" step="0.1" className="input" value={(form as any)[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3">
              <label className="label">Notas</label>
              <input className="input" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="btn-primary flex-1">Guardar</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      {selectedMember && latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Peso', value: latest.weight ? `${latest.weight} kg` : '—' },
            { label: 'IMC', value: latest.bmi || '—' },
            { label: 'Cintura', value: latest.waist ? `${latest.waist} cm` : '—' },
            { label: 'Última med.', value: formatDate(latest.recordedAt) },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center">
              <p className="text-2xl font-bold text-primary-400">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 1 && (
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-400" />Evolución del peso</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Line type="monotone" dataKey="peso" stroke="#e94560" strokeWidth={2} dot={false} name="Peso (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!selectedMember && (
        <div className="text-center py-16 text-slate-500">
          <Scale className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Seleccioná un alumno para ver su evolución</p>
        </div>
      )}
    </div>
  )
}
