'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { User, Lock, Bell, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { getInitials } from '@/lib/utils'
import { PageSpinner } from '@/components/ui/Spinner'

type Tab = 'profile' | 'password' | 'notifications'

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile')
  const user = getUser()

  const { data: meData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me(),
  })
  const me = meData?.data

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary-400">
          {(me?.name ?? user?.name ?? 'U').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{me?.name ?? user?.name}</h1>
          <p className="text-slate-400 text-sm">{me?.email ?? user?.email}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
        {([
          { key: 'profile', label: 'Perfil', icon: User },
          { key: 'password', label: 'Contraseña', icon: Lock },
          { key: 'notifications', label: 'Notificaciones', icon: Bell },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab me={me} />}
      {tab === 'password' && <PasswordTab />}
      {tab === 'notifications' && <NotificationsTab />}
    </div>
  )
}

function ProfileTab({ me }: { me: any }) {
  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: { name: me?.name ?? '', phone: me?.phone ?? '' },
  })

  function onSubmit(data: any) {
    toast.success('Perfil actualizado')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
      <div>
        <label className="label">Nombre completo</label>
        <input {...register('name')} className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input value={me?.email ?? ''} disabled className="input opacity-50 cursor-not-allowed" />
        <p className="text-xs text-slate-500 mt-1">El email no puede modificarse</p>
      </div>
      <div>
        <label className="label">Teléfono</label>
        <input {...register('phone')} className="input" placeholder="+54 11 1234-5678" />
      </div>
      <button type="submit" disabled={!isDirty} className="btn-primary flex items-center gap-2 py-2 disabled:opacity-50">
        <Save className="w-4 h-4" /> Guardar cambios
      </button>
    </form>
  )
}

function PasswordTab() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<{
    current: string; newPass: string; confirm: string
  }>()

  const changeMutation = useMutation({
    mutationFn: (data: any) => authApi.changePassword(data),
    onSuccess: () => { toast.success('Contraseña actualizada'); reset() },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Error al cambiar contraseña'),
  })

  return (
    <form
      onSubmit={handleSubmit(d => changeMutation.mutate({ currentPassword: d.current, newPassword: d.newPass }))}
      className="card space-y-4"
    >
      <div>
        <label className="label">Contraseña actual *</label>
        <input {...register('current', { required: true })} type="password" className="input" />
      </div>
      <div>
        <label className="label">Nueva contraseña *</label>
        <input
          {...register('newPass', { required: true, minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
          type="password"
          className="input"
        />
        {errors.newPass && <p className="text-red-400 text-xs mt-1">{errors.newPass.message}</p>}
      </div>
      <div>
        <label className="label">Confirmar nueva contraseña *</label>
        <input
          {...register('confirm', { validate: v => v === watch('newPass') || 'Las contraseñas no coinciden' })}
          type="password"
          className="input"
        />
        {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
      </div>
      <button type="submit" disabled={changeMutation.isPending} className="btn-primary flex items-center gap-2 py-2">
        <Lock className="w-4 h-4" />
        {changeMutation.isPending ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailPayments: true,
    emailRoutines: true,
    pushPayments: false,
    pushRoutines: false,
  })

  function toggle(key: keyof typeof prefs) {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
    toast.success('Preferencia guardada')
  }

  return (
    <div className="card space-y-4">
      <p className="text-sm text-slate-400">Configura qué notificaciones querés recibir.</p>
      {[
        { key: 'emailPayments', label: 'Email — Recordatorio de pagos', desc: '7, 3 y 1 día antes del vencimiento' },
        { key: 'emailRoutines', label: 'Email — Vencimiento de rutina', desc: 'Cuando tu rutina está por vencer' },
        { key: 'pushPayments', label: 'Push — Recordatorio de pagos', desc: 'Notificación en tu dispositivo' },
        { key: 'pushRoutines', label: 'Push — Vencimiento de rutina', desc: 'Notificación en tu dispositivo' },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
          <button
            onClick={() => toggle(key as keyof typeof prefs)}
            className={`relative w-10 h-6 rounded-full transition-colors ${prefs[key as keyof typeof prefs] ? 'bg-primary-500' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${prefs[key as keyof typeof prefs] ? 'left-5' : 'left-1'}`} />
          </button>
        </div>
      ))}
    </div>
  )
}
