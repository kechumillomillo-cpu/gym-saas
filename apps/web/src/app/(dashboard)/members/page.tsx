'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { membersApi } from '@/lib/api'
import { cn, getInitials, statusColor, statusLabel, formatDate } from '@/lib/utils'
import { Search, Plus, QrCode, Filter, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { MemberForm } from '@/components/members/MemberForm'

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'INACTIVE', label: 'Inactivos' },
  { value: 'SUSPENDED', label: 'Suspendidos' },
]

export default function MembersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['members', { search, status, page }],
    queryFn: () => membersApi.list({ search, status, page, limit: 20 }).then((r) => r.data),
  })

  const handleCreated = () => {
    qc.invalidateQueries({ queryKey: ['members'] })
    setShowForm(false)
    toast.success('Alumno creado')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre, DNI, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="input w-auto"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          >
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo alumno</span>
          </button>
        </div>
      </div>

      {showForm && <MemberForm onSuccess={handleCreated} onCancel={() => setShowForm(false)} />}

      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="divide-y divide-slate-700/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-10 h-10 bg-slate-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-700/30">
              {data?.data?.map((member: any) => (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-700/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold text-sm flex-shrink-0">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      getInitials(member.firstName, member.lastName)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{member.firstName} {member.lastName}</p>
                    <p className="text-sm text-slate-400 truncate">{member.email || member.phone || member.dni}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn('badge', statusColor(member.status))}>
                      {statusLabel(member.status)}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {member.routineAssigns?.[0]?.routine?.name || '—'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </Link>
              ))}
              {data?.data?.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No se encontraron alumnos</p>
                </div>
              )}
            </div>
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-700/30">
                <span className="text-sm text-slate-400">{data.meta.total} alumnos</span>
                <div className="flex gap-2">
                  <button className="btn-secondary py-1.5 px-3 text-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
                  <button className="btn-secondary py-1.5 px-3 text-sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
