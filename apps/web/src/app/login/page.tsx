'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Dumbbell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  gymSlug: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Requerido'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gymSlug: 'demo-gym' },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await login(data.email, data.password, data.gymSlug)
      toast.success(`¡Bienvenido!`)
      if (result.user.role === 'MEMBER') router.push('/app')
      else router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Credenciales inválidas')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-2xl mb-4">
            <Dumbbell className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">GymSaaS</h1>
          <p className="text-slate-400 mt-2">Gestión integral de gimnasios</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Iniciar sesión</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Código del gimnasio</label>
              <input
                {...register('gymSlug')}
                className="input"
                placeholder="demo-gym"
                autoCapitalize="none"
              />
              {errors.gymSlug && <p className="text-red-400 text-xs mt-1">{errors.gymSlug.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder="admin@fitpro.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Ingresando...</span> : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-dark-900 rounded-lg text-sm text-slate-400">
            <p className="font-medium text-slate-300 mb-2">Credenciales demo:</p>
            <p>👤 admin@fitpro.com / Admin1234!</p>
            <p>🏋️ Gym: demo-gym</p>
          </div>
        </div>
      </div>
    </div>
  )
}
