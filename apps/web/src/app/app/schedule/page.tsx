'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, schedulesApi } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { Calendar, Clock, Users, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function MySchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const qc = useQueryClient()

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => authApi.me().then(r => r.data) })
  const memberId = me?.member?.id

  const { data: slots } = useQuery({
    queryKey: ['slots'],
    queryFn: () => schedulesApi.slots().then(r => r.data),
  })

  const { data: reservations } = useQuery({
    queryKey: ['my-reservations', memberId],
    queryFn: () => schedulesApi.reservations({ memberId }).then(r => r.data),
    enabled: !!memberId,
  })

  const { data: holidays } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => schedulesApi.holidays().then(r => r.data),
  })

  const selectedDayOfWeek = new Date(selectedDate + 'T12:00:00').getDay() || 7
  const isHoliday = holidays?.some((h: any) => h.date.startsWith(selectedDate))
  const daySlots = slots?.filter((s: any) => s.dayOfWeek === selectedDayOfWeek) || []

  const myReservationIds = new Set(
    reservations?.filter((r: any) => r.date?.startsWith(selectedDate) && r.status === 'CONFIRMED').map((r: any) => r.slotId)
  )

  const handleReserve = async (slotId: string) => {
    if (!memberId) return
    try {
      await schedulesApi.reserve({ slotId, date: selectedDate, memberId })
      qc.invalidateQueries({ queryKey: ['my-reservations'] })
      toast.success('Turno reservado')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo reservar')
    }
  }

  const handleCancel = async (slotId: string) => {
    const res = reservations?.find((r: any) => r.slotId === slotId && r.date?.startsWith(selectedDate))
    if (!res) return
    try {
      await schedulesApi.cancelReservation(res.id)
      qc.invalidateQueries({ queryKey: ['my-reservations'] })
      toast.success('Reserva cancelada')
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Seleccioná un día</label>
        <input
          type="date"
          className="input"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {isHoliday && (
        <div className="card border-orange-500/30 bg-orange-500/5 flex items-center gap-2">
          <X className="w-4 h-4 text-orange-400" />
          <p className="text-sm text-orange-300">El gimnasio está cerrado este día (feriado / día no hábil)</p>
        </div>
      )}

      {!isHoliday && (
        <>
          <p className="text-sm text-slate-400 font-medium">{DAY_NAMES[selectedDayOfWeek]} {formatDate(selectedDate)}</p>

          {daySlots.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay turnos para este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {daySlots.map((slot: any) => {
                const isReserved = myReservationIds.has(slot.id)
                return (
                  <div key={slot.id} className={cn('card transition-all', isReserved && 'border-green-500/30 bg-green-500/5')}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', isReserved ? 'bg-green-500/20' : 'bg-slate-700')}>
                        <Clock className={cn('w-5 h-5', isReserved ? 'text-green-400' : 'text-slate-400')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{slot.name}</p>
                        <p className="text-sm text-slate-400">{slot.startTime} — {slot.endTime}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          {slot.capacity} cupos
                        </p>
                      </div>
                      {isReserved ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Reservado
                          </span>
                          <button
                            onClick={() => handleCancel(slot.id)}
                            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleReserve(slot.id)} className="btn-primary text-sm py-2 px-4">
                          Reservar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* My upcoming reservations */}
      {reservations && reservations.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-slate-300 mb-3">Mis próximas reservas</h3>
          <div className="space-y-2">
            {reservations.filter((r: any) => r.status === 'CONFIRMED' && new Date(r.date) >= new Date()).slice(0, 5).map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.slot?.name}</p>
                  <p className="text-xs text-slate-400">{formatDate(r.date)} · {r.slot?.startTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
