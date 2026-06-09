'use client'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { schedulesApi } from '@/lib/api'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

export default function SlotReservationsPage({ params }: { params: Promise<{ slotId: string }> }) {
  const { slotId } = use(params)

  const { data: res, isLoading } = useQuery({
    queryKey: ['slot-reservations', slotId],
    queryFn: () => schedulesApi.reservations({ slotId }),
  })
  const reservations: any[] = res?.data ?? []

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/schedules" className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Reservas del turno</h1>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-400" />
          <h2 className="font-semibold">{reservations.length} reserva{reservations.length !== 1 ? 's' : ''}</h2>
        </div>

        {reservations.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-sm">Sin reservas para este turno</p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {reservations.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{r.member?.firstName} {r.member?.lastName}</p>
                  <p className="text-xs text-slate-400">{r.member?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === 'CONFIRMED' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  <span className={`text-xs font-medium ${r.status === 'CONFIRMED' ? 'text-green-400' : r.status === 'CANCELLED' ? 'text-red-400' : 'text-slate-400'}`}>
                    {r.status === 'CONFIRMED' ? 'Confirmado' : r.status === 'CANCELLED' ? 'Cancelado' : r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
