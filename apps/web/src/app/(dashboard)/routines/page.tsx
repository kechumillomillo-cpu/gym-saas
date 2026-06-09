'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { routinesApi } from '@/lib/api'
import { Dumbbell, Plus, Users, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RoutinesPage() {
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data: routines, isLoading } = useQuery({
    queryKey: ['routines'],
    queryFn: () => routinesApi.list().then(r => r.data),
  })

  const { data: expiring } = useQuery({
    queryKey: ['routines-expiring'],
    queryFn: () => routinesApi.expiring(7).then(r => r.data),
  })

  return (
    <div className="space-y-4">
      {expiring && expiring.length > 0 && (
        <div className="card border border-orange-500/30 bg-orange-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-400">{expiring.length} rutina{expiring.length !== 1 ? 's' : ''} próxima{expiring.length !== 1 ? 's' : ''} a vencer</p>
              <div className="mt-2 space-y-1">
                {expiring.slice(0, 3).map((r: any) => (
                  <p key={r.id} className="text-sm text-slate-300">
                    {r.member.firstName} {r.member.lastName} — {r.routine.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Link href="/routines/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva rutina
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card animate-pulse h-32" />
        )) : routines?.map((r: any) => (
          <Link key={r.id} href={`/routines/${r.id}`} className="card hover:border-primary-500/50 transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="font-semibold mt-3">{r.name}</h3>
            {r.goal && <p className="text-sm text-slate-400 mt-1 truncate">{r.goal}</p>}
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.durationWeeks} sem.</span>
              <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" />{r.exercises?.length || 0} ejercicios</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{r._count?.assignments || 0} alumnos</span>
            </div>
            {r.isTemplate && (
              <span className="inline-block mt-2 text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Template</span>
            )}
          </Link>
        ))}
      </div>

      {!isLoading && (!routines || routines.length === 0) && (
        <div className="text-center py-16 text-slate-500">
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay rutinas creadas</p>
          <Link href="/routines/new" className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />Crear primera rutina
          </Link>
        </div>
      )}
    </div>
  )
}
