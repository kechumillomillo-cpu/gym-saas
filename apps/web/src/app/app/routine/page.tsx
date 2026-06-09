'use client'
import { useQuery } from '@tanstack/react-query'
import { authApi, api } from '@/lib/api'
import { formatDate, getDaysUntil, cn } from '@/lib/utils'
import { Dumbbell, Clock, AlertTriangle, Download, Printer } from 'lucide-react'

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function MyRoutinePage() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => authApi.me().then(r => r.data) })
  const memberId = me?.member?.id

  const { data: assign, isLoading } = useQuery({
    queryKey: ['my-active-routine', memberId],
    queryFn: () => api.get(`/routines/member/${memberId}`).then(r => r.data).catch(() => null),
    enabled: !!memberId,
  })

  const handlePrint = () => window.print()

  const handleDownloadPDF = async () => {
    window.print()
  }

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card animate-pulse h-20" />
      ))}
    </div>
  )

  if (!assign?.routine) {
    return (
      <div className="text-center py-16">
        <Dumbbell className="w-14 h-14 mx-auto text-slate-600 mb-3" />
        <h2 className="font-semibold text-lg">Sin rutina asignada</h2>
        <p className="text-slate-400 text-sm mt-2">Tu entrenador aún no te asignó una rutina.</p>
      </div>
    )
  }

  const { routine, expiresAt, startsAt } = assign
  const daysLeft = getDaysUntil(expiresAt)
  const byDay = routine.exercises?.reduce((acc: any, ex: any) => {
    const d = ex.dayOfWeek
    if (!acc[d]) acc[d] = []
    acc[d].push(ex)
    return acc
  }, {}) || {}

  return (
    <div className="space-y-4 print:space-y-2">
      {/* Header */}
      <div className="card print:border-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{routine.name}</h1>
            {routine.goal && <p className="text-sm text-slate-400 mt-1">{routine.goal}</p>}
            {routine.description && <p className="text-sm text-slate-400 mt-1">{routine.description}</p>}
          </div>
          <div className={cn('badge flex-shrink-0', daysLeft <= 3 ? 'text-red-400 bg-red-400/10' : daysLeft <= 7 ? 'text-orange-400 bg-orange-400/10' : 'text-green-400 bg-green-400/10')}>
            {daysLeft > 0 ? `${daysLeft}d` : 'Vencida'}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{routine.durationWeeks} semanas</span>
          <span>Inicio: {formatDate(startsAt)}</span>
          <span>Vence: {formatDate(expiresAt)}</span>
        </div>
      </div>

      {daysLeft <= 7 && daysLeft > 0 && (
        <div className="card border-orange-500/30 bg-orange-500/5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <p className="text-sm text-orange-300">Tu rutina vence en {daysLeft} días. Hablá con tu entrenador para renovarla.</p>
        </div>
      )}

      {/* Print buttons */}
      <div className="flex gap-2 print:hidden">
        <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
        <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <Download className="w-4 h-4" />
          Descargar PDF
        </button>
      </div>

      {/* Exercises by day */}
      {Object.entries(byDay).sort((a, b) => Number(a[0]) - Number(b[0])).map(([day, exercises]: any) => (
        <div key={day} className="card print:border print:border-slate-300">
          <h2 className="font-semibold text-primary-400 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center text-xs">{day}</span>
            {DAY_NAMES[Number(day)]}
          </h2>
          <div className="space-y-3">
            {exercises.map((ex: any, i: number) => (
              <div key={ex.id} className="flex gap-3 p-3 bg-dark-900 rounded-lg print:bg-transparent print:border-b print:border-slate-200">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{ex.exercise?.name}</p>
                  {ex.exercise?.category && <p className="text-xs text-slate-500">{ex.exercise.category.name}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    <span className="bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                      {ex.sets} series × {ex.reps} reps
                    </span>
                    {ex.weight && (
                      <span className="bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                        {ex.weight}
                      </span>
                    )}
                    <span className="bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                      Descanso: {ex.restSecs}s
                    </span>
                  </div>
                  {ex.notes && <p className="text-xs text-slate-500 mt-1 italic">{ex.notes}</p>}
                  {ex.exercise?.description && <p className="text-xs text-slate-500 mt-1">{ex.exercise.description}</p>}
                </div>
                {ex.exercise?.imageUrl && (
                  <img src={ex.exercise.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(byDay).length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">Esta rutina no tiene ejercicios cargados.</p>
        </div>
      )}
    </div>
  )
}
