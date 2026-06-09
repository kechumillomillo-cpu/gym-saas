'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { schedulesApi } from '@/lib/api'
import { Calendar, Clock, Users, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const DAYS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function SchedulesPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', capacity: 20 })
  const qc = useQueryClient()

  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots'],
    queryFn: () => schedulesApi.slots().then(r => r.data),
  })

  const grouped = slots?.reduce((acc: any, slot: any) => {
    const day = slot.dayOfWeek
    if (!acc[day]) acc[day] = []
    acc[day].push(slot)
    return acc
  }, {}) || {}

  const handleCreate = async () => {
    try {
      await schedulesApi.createSlot(form)
      qc.invalidateQueries({ queryKey: ['slots'] })
      setShowForm(false)
      toast.success('Turno creado')
    } catch { toast.error('Error al crear turno') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este turno?')) return
    try {
      await schedulesApi.deleteSlot(id)
      qc.invalidateQueries({ queryKey: ['slots'] })
      toast.success('Turno eliminado')
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo turno
        </button>
      </div>

      {showForm && (
        <div className="card border border-primary-500/30">
          <h3 className="font-semibold mb-4">Crear turno</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre</label>
              <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Musculación AM" />
            </div>
            <div>
              <label className="label">Día</label>
              <select className="input" value={form.dayOfWeek} onChange={(e) => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}>
                {DAYS.slice(1).map((d, i) => <option key={i + 1} value={i + 1}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Cupos</label>
              <input type="number" className="input" value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Inicio</label>
              <input type="time" className="input" value={form.startTime} onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="label">Fin</label>
              <input type="time" className="input" value={form.endTime} onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="btn-primary flex-1">Crear</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).sort((a, b) => Number(a[0]) - Number(b[0])).map(([day, daySlots]: any) => (
          <div key={day} className="card">
            <h3 className="font-semibold mb-3 text-primary-400">{DAYS[Number(day)]}</h3>
            <div className="space-y-2">
              {daySlots.map((slot: any) => (
                <div key={slot.id} className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{slot.name}</p>
                    <p className="text-xs text-slate-400">{slot.startTime} — {slot.endTime}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Users className="w-3 h-3" />
                    {slot.capacity}
                  </div>
                  <button onClick={() => handleDelete(slot.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!isLoading && Object.keys(grouped).length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay turnos configurados</p>
          </div>
        )}
      </div>
    </div>
  )
}
