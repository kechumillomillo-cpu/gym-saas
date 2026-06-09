'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { routinesApi, exercisesApi } from '@/lib/api'
import { ArrowLeft, Plus, Trash2, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const DAYS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function NewRoutinePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', goal: '', durationWeeks: 4, description: '', isTemplate: false })
  const [exercises, setExercises] = useState<any[]>([])
  const [selectedExId, setSelectedExId] = useState('')
  const [selectedDay, setSelectedDay] = useState(1)

  const { data: exerciseList } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exercisesApi.list().then(r => r.data),
  })

  const addExercise = () => {
    if (!selectedExId) return
    const ex = exerciseList?.find((e: any) => e.id === selectedExId)
    if (!ex) return
    setExercises(prev => [...prev, {
      exerciseId: selectedExId,
      exerciseName: ex.name,
      dayOfWeek: selectedDay,
      sets: 3,
      reps: '10',
      restSecs: 60,
      weight: '',
    }])
    setSelectedExId('')
  }

  const removeExercise = (i: number) => setExercises(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!form.name) return toast.error('Nombre requerido')
    setLoading(true)
    try {
      await routinesApi.create({
        ...form,
        exercises: exercises.map((e, i) => ({
          exerciseId: e.exerciseId,
          dayOfWeek: e.dayOfWeek,
          order: i,
          sets: e.sets,
          reps: String(e.reps),
          weight: e.weight || undefined,
          restSecs: e.restSecs,
        })),
      })
      toast.success('Rutina creada')
      router.push('/routines')
    } catch { toast.error('Error al crear rutina') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/routines" className="flex items-center gap-2 text-slate-400 hover:text-white w-fit text-sm">
        <ArrowLeft className="w-4 h-4" />Volver
      </Link>

      <div className="card">
        <h2 className="font-semibold mb-4">Nueva rutina</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Nombre *</label>
            <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Rutina Fuerza A/B" />
          </div>
          <div>
            <label className="label">Objetivo</label>
            <input className="input" value={form.goal} onChange={(e) => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="Pérdida de peso, hipertrofia..." />
          </div>
          <div>
            <label className="label">Duración (semanas)</label>
            <input type="number" className="input" value={form.durationWeeks} onChange={(e) => setForm(f => ({ ...f, durationWeeks: Number(e.target.value) }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descripción</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="template" checked={form.isTemplate} onChange={(e) => setForm(f => ({ ...f, isTemplate: e.target.checked }))} className="accent-primary-500" />
            <label htmlFor="template" className="text-sm text-slate-300">Guardar como template</label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-primary-400" />Ejercicios</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <select className="input flex-1 min-w-0" value={selectedExId} onChange={(e) => setSelectedExId(e.target.value)}>
            <option value="">Elegir ejercicio...</option>
            {exerciseList?.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select className="input w-32" value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))}>
            {DAYS.slice(1).map((d, i) => <option key={i + 1} value={i + 1}>{d}</option>)}
          </select>
          <button onClick={addExercise} className="btn-primary flex items-center gap-1 whitespace-nowrap">
            <Plus className="w-4 h-4" />Agregar
          </button>
        </div>

        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 p-3 bg-dark-900 rounded-lg">
              <span className="text-sm font-medium flex-1 min-w-[120px]">{ex.exerciseName}</span>
              <span className="text-xs text-slate-400">{DAYS[ex.dayOfWeek]}</span>
              <input type="number" className="input w-16 py-1.5 text-xs" placeholder="Series" value={ex.sets}
                onChange={(e) => setExercises(prev => prev.map((x, j) => j === i ? { ...x, sets: Number(e.target.value) } : x))} />
              <input type="text" className="input w-20 py-1.5 text-xs" placeholder="Reps" value={ex.reps}
                onChange={(e) => setExercises(prev => prev.map((x, j) => j === i ? { ...x, reps: e.target.value } : x))} />
              <input type="text" className="input w-20 py-1.5 text-xs" placeholder="Peso" value={ex.weight}
                onChange={(e) => setExercises(prev => prev.map((x, j) => j === i ? { ...x, weight: e.target.value } : x))} />
              <button onClick={() => removeExercise(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">Agregá ejercicios a la rutina</p>
          )}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3">
        {loading ? 'Guardando...' : 'Crear rutina'}
      </button>
    </div>
  )
}
