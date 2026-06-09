'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { membersApi, routinesApi } from '@/lib/api'
import { formatCurrency, formatDate, statusColor, statusLabel, getDaysUntil, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowLeft, QrCode, Phone, Mail, Edit, Dumbbell, CreditCard, Clock, Activity, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { MemberForm } from '@/components/members/MemberForm'
import QRCodeComponent from 'qrcode.react'
import toast from 'react-hot-toast'

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [showQr, setShowQr] = useState(false)

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.get(id).then((r) => r.data),
  })

  const { data: qrData } = useQuery({
    queryKey: ['member-qr', id],
    queryFn: () => membersApi.qr(id).then((r) => r.data),
    enabled: showQr,
  })

  if (isLoading) return <div className="card animate-pulse h-40" />
  if (!member) return <p className="text-slate-400">Alumno no encontrado</p>

  const activeRoutine = member.routineAssigns?.find((r: any) => r.isActive)
  const daysUntilExpiry = activeRoutine ? getDaysUntil(activeRoutine.expiresAt) : null

  return (
    <div className="space-y-4 animate-fade-in">
      <Link href="/members" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver a alumnos</span>
      </Link>

      {editing ? (
        <MemberForm
          memberId={id}
          defaultValues={member}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['member', id] }); setEditing(false); toast.success('Alumno actualizado') }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          {/* Header card */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-xl font-bold flex-shrink-0">
                {member.photoUrl ? (
                  <img src={member.photoUrl} className="w-16 h-16 rounded-full object-cover" alt="" />
                ) : getInitials(member.firstName, member.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold">{member.firstName} {member.lastName}</h2>
                  <span className={cn('badge', statusColor(member.status))}>{statusLabel(member.status)}</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                  {member.dni && <span>DNI {member.dni}</span>}
                  {member.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.phone}</span>}
                  {member.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</span>}
                </div>
                {member.joinedAt && (
                  <p className="text-xs text-slate-500 mt-1">Alumno desde {formatDate(member.joinedAt)}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setShowQr(!showQr)} className="btn-ghost p-2" title="Ver QR">
                  <QrCode className="w-5 h-5" />
                </button>
                <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 py-2">
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
              </div>
            </div>

            {showQr && (
              <div className="mt-4 p-4 bg-white rounded-xl w-fit mx-auto">
                <QRCodeComponent
                  value={JSON.stringify({ gymId: member.gymId, memberId: member.id, type: 'attendance' })}
                  size={180}
                />
                <p className="text-center text-dark-950 text-xs mt-2 font-medium">
                  {member.firstName} {member.lastName}
                </p>
              </div>
            )}
          </div>

          {/* Routine card */}
          {activeRoutine && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2"><Dumbbell className="w-4 h-4 text-primary-400" />Rutina activa</h3>
                {daysUntilExpiry !== null && (
                  <span className={cn('badge', daysUntilExpiry <= 3 ? 'text-red-400 bg-red-400/10' : daysUntilExpiry <= 7 ? 'text-orange-400 bg-orange-400/10' : 'text-green-400 bg-green-400/10')}>
                    {daysUntilExpiry > 0 ? `Vence en ${daysUntilExpiry}d` : 'Vencida'}
                  </span>
                )}
              </div>
              <p className="text-lg font-medium">{activeRoutine.routine?.name}</p>
              {activeRoutine.routine?.goal && <p className="text-sm text-slate-400 mt-1">{activeRoutine.routine.goal}</p>}
              <p className="text-xs text-slate-500 mt-2">
                {formatDate(activeRoutine.startsAt)} — {formatDate(activeRoutine.expiresAt)}
              </p>
            </div>
          )}

          {/* Payments */}
          <div className="card">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><CreditCard className="w-4 h-4 text-primary-400" />Últimos pagos</h3>
            <div className="space-y-2">
              {member.payments?.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/20">
                  <div>
                    <span className={cn('badge mr-2', statusColor(p.status))}>{statusLabel(p.status)}</span>
                    <span className="text-slate-400">{p.paidAt ? formatDate(p.paidAt) : p.dueDate ? `Vence ${formatDate(p.dueDate)}` : '—'}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(Number(p.amount))}</span>
                </div>
              ))}
              {(!member.payments || member.payments.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">Sin pagos registrados</p>
              )}
            </div>
          </div>

          {/* Attendance */}
          <div className="card">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-primary-400" />Asistencia reciente</h3>
            <div className="space-y-1">
              {member.attendances?.slice(0, 10).map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 text-sm py-1.5 border-b border-slate-700/20">
                  <Activity className="w-3 h-3 text-green-400" />
                  <span className="text-slate-300">{formatDate(a.checkedInAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-xs text-slate-500 ml-auto">{a.method}</span>
                </div>
              ))}
              {(!member.attendances || member.attendances.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">Sin asistencias registradas</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
