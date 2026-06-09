'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { Settings, Users, Shield, Plus, UserX } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ROLES = ['OWNER', 'ADMIN', 'TRAINER', 'RECEPTIONIST', 'MEMBER']
const roleColors: Record<string, string> = {
  OWNER: 'text-yellow-400 bg-yellow-400/10',
  ADMIN: 'text-blue-400 bg-blue-400/10',
  TRAINER: 'text-green-400 bg-green-400/10',
  RECEPTIONIST: 'text-purple-400 bg-purple-400/10',
  MEMBER: 'text-slate-400 bg-slate-400/10',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'gym' | 'users' | 'audit'>('gym')
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({ email: '', password: '', role: 'TRAINER' })
  const qc = useQueryClient()

  const { data: gym } = useQuery({ queryKey: ['admin-gym'], queryFn: () => adminApi.getGym().then(r => r.data) })
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers().then(r => r.data) })
  const { data: audit } = useQuery({ queryKey: ['audit'], queryFn: () => adminApi.getAudit().then(r => r.data) })

  const handleCreateUser = async () => {
    try {
      await adminApi.createUser(userForm)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Usuario creado')
      setShowUserForm(false)
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error') }
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('¿Desactivar este usuario?')) return
    try {
      await adminApi.deactivate(id)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Usuario desactivado')
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-700/50">
        {[
          { key: 'gym', label: 'Configuración', icon: Settings },
          { key: 'users', label: 'Usuarios', icon: Users },
          { key: 'audit', label: 'Auditoría', icon: Shield },
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

      {activeTab === 'gym' && gym && (
        <div className="card">
          <h3 className="font-semibold mb-4">Datos del gimnasio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nombre', value: gym.name },
              { label: 'Email', value: gym.email },
              { label: 'Teléfono', value: gym.phone || '—' },
              { label: 'Ciudad', value: gym.city || '—' },
              { label: 'Plan', value: gym.plan },
              { label: 'Zona horaria', value: gym.timezone },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowUserForm(!showUserForm)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo usuario
            </button>
          </div>

          {showUserForm && (
            <div className="card border border-primary-500/30">
              <h3 className="font-semibold mb-4">Crear usuario de staff</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={userForm.email} onChange={(e) => setUserForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Contraseña</label>
                  <input className="input" type="password" value={userForm.password} onChange={(e) => setUserForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Rol</label>
                  <select className="input" value={userForm.role} onChange={(e) => setUserForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.filter(r => r !== 'OWNER').map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleCreateUser} className="btn-primary flex-1">Crear</button>
                <button onClick={() => setShowUserForm(false)} className="btn-secondary">Cancelar</button>
              </div>
            </div>
          )}

          <div className="card overflow-hidden p-0">
            <div className="divide-y divide-slate-700/30">
              {users?.map((u: any) => (
                <div key={u.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{u.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Último acceso: {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Nunca'}</p>
                  </div>
                  <span className={cn('badge', roleColors[u.role])}>{u.role}</span>
                  <span className={cn('text-xs font-medium', u.isActive ? 'text-green-400' : 'text-slate-500')}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  {u.role !== 'OWNER' && u.isActive && (
                    <button onClick={() => handleDeactivate(u.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="card overflow-hidden p-0">
          <div className="divide-y divide-slate-700/30">
            {audit?.data?.map((log: any) => (
              <div key={log.id} className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-medium">{log.action} — {log.entity}</p>
                  <span className="text-xs text-slate-500 ml-auto">{formatDate(log.createdAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{log.user?.email}</p>
              </div>
            ))}
            {(!audit?.data || audit.data.length === 0) && (
              <p className="text-center py-8 text-slate-500">Sin registros de auditoría</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
