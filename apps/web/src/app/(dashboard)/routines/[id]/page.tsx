'use client'
import { use, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { routinesApi, membersApi } from '@/lib/api'
import { ArrowLeft, Dumbbell, Plus, Users, UserPlus, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()
  const [assignMemberId, setAssignMemberId] = useState('')
  const [showAssign, setShowAssign] = useState(false)

  const { data: routine, isLoading } = useQuery({
    queryKey: ['routine', id],
    queryFn: () => routinesApi.get(id).then(r => r.data),
  })

  const { data: membersData } = useQuery({
    queryKey: ['members-mini'],
    queryFn: () => membersApi.list({ limit: 200 }).then(r => r.data),
  })

  const handleAssign = async () => {
    if (!assignMemberId) return
    try {
      await routinesApi.assign({ routineId: id, memberId: assignMemberId })
      qc.invalidateQueries({ queryKey: ['routine', id] })
      toast.success('Rutina asignada')
      setShowAssign(false)
      setAssignMemberId('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error')
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta rutina? Esta acción no se puede deshacer.')) return
    try {
      await routinesApi.delete(id)
      toast.success('Rutina eliminada')
      window.history.back()
    } catch { toast.error('Error') }
  }

  if (isLoading) return <div className="card animate-pulse h-40" />
  if (!routine) return <p className="text-slate-400">Rutina no encontrada</p>

  const byDay = routine.exercises?.reduce((acc: any, ex: any) => {
    const d = ex.dayOfWeek
    if (!acc[d]) acc[d] = []
    acc[d].push(ex)
    return acc
  }, {}) || {}

  return (
    <div className="space-y-4 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between">
        <Link href="/routines" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex gap-2">
          <Link href={`/routines/${id}/edit`} className="btn-secondary flex items-center gap-2 py-2 text-sm">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <button onClick={handleDelete} className="btn-ghost text-red-400 hover:text-red-300 py-2 text-sm">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="card">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{routine.name}</h1>
            {routine.goal && <p className="text-slate-400 mt-1">{routine.goal}</p>}
            {routine.description && <p className="text-sm text-slate-500 mt-1">{routine.description}</p>}
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
              <span>{routine.durationWeeks} semanas</span>
              <span>·</span>
              <span>{routine.exercises?.length || 0} ejercicios</span>
              {routine.isTemplate && <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded text-xs">Template</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Assign */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-primary-400" />Asignar a alumno</h3>
          <button onClick={() => setShowAssign(!showAssign)} className="btn-primary flex items-center gap-2 py-2 text-sm">
            <UserPlus className="w-4 h-4" />
            Asignar
          </button>
        </div>
        {showAssign && (
          <div className="flex gap-2 mt-2">
            <select className="input flex-1" value={assignMemberId} onChange={e => setAssignMemberId(e.target.value)}>
              <option value="">Elegir alumno...</option>
              {membersData?.data?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
            <button onClick={handleAssign} disabled={!assignMemberId} className="btn-primary">Asignar</button>
            <button onClick={() => setShowAssign(false)} className="btn-secondary">Cancelar</button>
          </div>
        )}
      </div>

      {/* Exercises by day */}
      {Object.entries(byDay).sort((a, b) => Number(a[0]) - Number(b[0])).map(([day, exs]: any) => (
        <div key={day} className="card">
          <h2 className="font-semibold text-primary-400 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-primary-500/20 rounded-full flex items-center justify-center text-sm">{day}</span>
            {DAY_NAMES[Number(day)]}
            <span className="text-xs text-slate-500 font-normal ml-auto">{exs.length} ejercicio{exs.length !== 1 ? 's' : ''}</span>
          </h2>
          <div className="space-y-3">
            {exs.map((ex: any) => (
              <div key={ex.id} className="flex gap-3 p-3 bg-dark-900 rounded-lg">
                {ex.exercise?.imageUrl ? (
                  <img src={ex.exercise.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{ex.exercise?.name}</p>
                  {ex.exercise?.muscleGroups?.length > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">{ex.exercise.muscleGroups.join(', ')}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md">
                      {ex.sets} series × {ex.reps} reps
                    </span>
                    {ex.weight && (
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md">{ex.weight}</span>
                    )}
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md">{ex.restSecs}s desc.</span>
                  </div>
                  {ex.notes && <p className="text-xs text-slate-500 mt-1 italic">{ex.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(byDay).length === 0 && (
        <div className="card text-center py-8 text-slate-500">
          <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No hay ejercicios en esta rutina</p>
          <Link href={`/routines/${id}/edit`} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Agregar ejercicios
          </Link>
        </div>
      )}
    </div>
  )
}
