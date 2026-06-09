'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { exercisesApi } from '@/lib/api'
import { Search, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const difficultyColors: Record<string, string> = {
  BEGINNER: 'text-green-400 bg-green-400/10',
  INTERMEDIATE: 'text-yellow-400 bg-yellow-400/10',
  ADVANCED: 'text-red-400 bg-red-400/10',
}

const difficultyLabels: Record<string, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}

export default function ExercisesPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => exercisesApi.categories().then(r => r.data),
  })

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', { search, categoryId }],
    queryFn: () => exercisesApi.list({ search, categoryId }).then(r => r.data),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories?.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card animate-pulse h-28" />
        )) : exercises?.map((ex: any) => (
          <div key={ex.id} className="card hover:border-slate-600 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{ex.name}</h3>
                {ex.category && <p className="text-xs text-slate-500 mt-0.5">{ex.category.name}</p>}
              </div>
              <span className={cn('badge ml-2 flex-shrink-0', difficultyColors[ex.difficulty])}>
                {difficultyLabels[ex.difficulty]}
              </span>
            </div>
            {ex.muscleGroups?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {ex.muscleGroups.slice(0, 3).map((m: string) => (
                  <span key={m} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{m}</span>
                ))}
              </div>
            )}
            {ex.equipment?.length > 0 && (
              <p className="text-xs text-slate-500 mt-1.5">🔧 {ex.equipment.join(', ')}</p>
            )}
          </div>
        ))}
      </div>

      {!isLoading && exercises?.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No se encontraron ejercicios</p>
        </div>
      )}

      <p className="text-sm text-slate-500 text-center">{exercises?.length || 0} ejercicios disponibles</p>
    </div>
  )
}
