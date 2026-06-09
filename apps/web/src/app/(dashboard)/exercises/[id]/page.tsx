'use client'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Dumbbell, Activity } from 'lucide-react'
import Link from 'next/link'
import { exercisesApi } from '@/lib/api'
import { PageSpinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'

const difficultyVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  BEGINNER: 'success', INTERMEDIATE: 'warning', ADVANCED: 'danger',
}
const difficultyLabel: Record<string, string> = {
  BEGINNER: 'Principiante', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado',
}

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: res, isLoading } = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exercisesApi.get(id),
  })
  const ex = res?.data

  if (isLoading) return <PageSpinner />
  if (!ex) return <div className="text-center py-20 text-slate-400">Ejercicio no encontrado</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/exercises" className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">{ex.name}</h1>
        <Badge variant={difficultyVariant[ex.difficulty] ?? 'default'}>
          {difficultyLabel[ex.difficulty] ?? ex.difficulty}
        </Badge>
      </div>

      <div className="card space-y-4">
        {ex.description && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Descripción</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{ex.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Categoría</h2>
            <p className="text-slate-300 text-sm">{ex.category?.name ?? '—'}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Equipamiento</h2>
            <p className="text-slate-300 text-sm">{ex.equipment ?? '—'}</p>
          </div>
        </div>

        {ex.muscles?.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Músculos
            </h2>
            <div className="flex flex-wrap gap-2">
              {ex.muscles.map((m: string) => (
                <span key={m} className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300">{m}</span>
              ))}
            </div>
          </div>
        )}

        {ex.videoUrl && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Video</h2>
            <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-sm underline">
              Ver demostración
            </a>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary-400" /> Instrucciones
        </h2>
        {ex.instructions ? (
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{ex.instructions}</p>
        ) : (
          <p className="text-slate-500 text-sm">Sin instrucciones detalladas.</p>
        )}
      </div>
    </div>
  )
}
