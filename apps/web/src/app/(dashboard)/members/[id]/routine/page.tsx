'use client'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Dumbbell, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { routinesApi } from '@/lib/api'
import { PageSpinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, getDaysUntil } from '@/lib/utils'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function MemberRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: res, isLoading } = useQuery({
    queryKey: ['member-routine', id],
    queryFn: () => routinesApi.getMemberRoutine(id),
  })
  const data = res?.data

  if (isLoading) return <PageSpinner />

  if (!data?.routine) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/members/${id}`} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Rutina del socio</h1>
        </div>
        <EmptyState icon={Dumbbell} title="Sin rutina asignada" description="Este socio aún no tiene una rutina asignada." />
      </div>
    )
  }

  const { routine, assign } = data
  const daysLeft = assign?.expiresAt ? getDaysUntil(assign.expiresAt) : null

  const exercisesByDay: Record<number, any[]> = {}
  routine.exercises?.forEach((ex: any) => {
    if (!exercisesByDay[ex.day]) exercisesByDay[ex.day] = []
    exercisesByDay[ex.day].push(ex)
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/members/${id}`} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">{routine.name}</h1>
      </div>

      {daysLeft !== null && daysLeft <= 7 && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${daysLeft <= 0 ? 'bg-red-400/10 border-red-400/30 text-red-400' : 'bg-orange-400/10 border-orange-400/30 text-orange-400'}`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">
              {daysLeft <= 0 ? 'Rutina vencida' : `Vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}`}
            </p>
            {assign?.expiresAt && <p className="text-xs opacity-75">{formatDate(assign.expiresAt)}</p>}
          </div>
        </div>
      )}

      <div className="card space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Duración</span>
          <span className="font-medium">90 días</span>
        </div>
        {assign?.startDate && (
          <div className="flex justify-between">
            <span className="text-slate-400">Inicio</span>
            <span className="font-medium">{formatDate(assign.startDate)}</span>
          </div>
        )}
        {assign?.expiresAt && (
          <div className="flex justify-between">
            <span className="text-slate-400">Vencimiento</span>
            <span className={`font-medium ${daysLeft !== null && daysLeft <= 7 ? 'text-orange-400' : ''}`}>{formatDate(assign.expiresAt)}</span>
          </div>
        )}
      </div>

      {DAYS.map((day, idx) => {
        const exercises = exercisesByDay[idx]
        if (!exercises?.length) return null
        return (
          <div key={day} className="card space-y-3">
            <h2 className="font-semibold text-primary-400">{day}</h2>
            <div className="space-y-2">
              {exercises.map((ex: any) => (
                <div key={ex.id} className="flex items-start gap-3 py-2 border-b border-slate-700/50 last:border-0">
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{ex.exercise?.name ?? ex.exerciseId}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                      <span>{ex.sets} series × {ex.reps} reps</span>
                      {ex.weight && <span>{ex.weight} kg</span>}
                      {ex.restSeconds && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{ex.restSeconds}s
                        </span>
                      )}
                    </div>
                    {ex.notes && <p className="text-xs text-slate-500 mt-1 italic">{ex.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
