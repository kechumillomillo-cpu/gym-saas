'use client'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceApi, membersApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { QrCode, UserCheck, Clock, BarChart2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'list' | 'qr' | 'manual'>('list')
  const [scanning, setScanning] = useState(false)
  const [manualMemberId, setManualMemberId] = useState('')
  const scannerRef = useRef<any>(null)
  const qc = useQueryClient()

  const { data: attendances, isLoading } = useQuery({
    queryKey: ['attendances'],
    queryFn: () => attendanceApi.list({ limit: 30 }).then(r => r.data),
  })

  const { data: todayCount } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => attendanceApi.today().then(r => r.data),
  })

  const { data: membersData } = useQuery({
    queryKey: ['members-mini'],
    queryFn: () => membersApi.list({ limit: 200 }).then(r => r.data),
  })

  useEffect(() => {
    if (activeTab === 'qr' && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false)
      scanner.render(async (decoded: string) => {
        try {
          const payload = JSON.parse(decoded)
          const result = await attendanceApi.checkIn(payload.memberId).catch(() =>
            fetch(`/api/v1/attendance/qr-checkin`, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
          )
          toast.success('Check-in registrado!')
          qc.invalidateQueries({ queryKey: ['attendances'] })
          qc.invalidateQueries({ queryKey: ['attendance-today'] })
        } catch { toast.error('QR inválido') }
      }, () => {})
      scannerRef.current = scanner
    }
    return () => {
      if (scannerRef.current && activeTab !== 'qr') {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [activeTab])

  const handleManualCheckIn = async () => {
    if (!manualMemberId) return
    try {
      await attendanceApi.checkIn(manualMemberId)
      toast.success('Asistencia registrada')
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['attendance-today'] })
      setManualMemberId('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-400">{typeof todayCount === 'number' ? todayCount : '—'}</p>
          <p className="text-sm text-slate-400 mt-1">Asistencias hoy</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-700/50">
        {[
          { key: 'list', label: 'Lista', icon: Clock },
          { key: 'qr', label: 'Leer QR', icon: QrCode },
          { key: 'manual', label: 'Manual', icon: UserCheck },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'qr' && (
        <div className="card">
          <p className="text-sm text-slate-400 mb-4">Apuntá la cámara al código QR del alumno para registrar su asistencia automáticamente.</p>
          <div id="qr-reader" className="mx-auto max-w-sm" />
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="card">
          <h3 className="font-semibold mb-4">Check-in manual</h3>
          <div className="flex gap-3">
            <select
              className="input flex-1"
              value={manualMemberId}
              onChange={(e) => setManualMemberId(e.target.value)}
            >
              <option value="">Seleccioná un alumno</option>
              {membersData?.data?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
            <button onClick={handleManualCheckIn} className="btn-primary" disabled={!manualMemberId}>
              Registrar
            </button>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="card overflow-hidden p-0">
          {isLoading ? (
            <p className="p-4 text-slate-400">Cargando...</p>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {attendances?.data?.map((a: any) => (
                <div key={a.id} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{a.member?.firstName} {a.member?.lastName}</p>
                    <p className="text-sm text-slate-400">{formatDate(a.checkedInAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className="text-xs text-slate-500">{a.method}</span>
                </div>
              ))}
              {attendances?.data?.length === 0 && (
                <p className="text-center py-8 text-slate-500">Sin asistencias</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
