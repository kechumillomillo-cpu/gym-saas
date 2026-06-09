'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Dumbbell, Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api'

const schema = z.object({
  gymName: z.string().min(3, 'Mínimo 3 caracteres'),
  gymSlug: z.string().min(3, 'Mínimo 3 caracteres').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  ownerName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/(?=.*[A-Z])(?=.*\d)/, 'Debe tener al menos 1 mayúscula y 1 número'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const gymName = watch('gymName', '')

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await authApi.register({
        gymName: data.gymName,
        gymSlug: data.gymSlug,
        ownerName: data.ownerName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
      })
      toast.success('¡Gimnasio registrado! Iniciando sesión...')
      router.push('/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <Dumbbell className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Crear tu gimnasio</h1>
          <p className="text-slate-400 mt-1">Completá los datos para empezar tu período de prueba gratuito</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <h2 className="font-semibold text-slate-300">Datos del Gimnasio</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre del gimnasio *</label>
              <input
                {...register('gymName', { onChange: e => setValue('gymSlug', autoSlug(e.target.value)) })}
                className="input"
                placeholder="FitPro Gym"
              />
              {errors.gymName && <p className="text-red-400 text-xs mt-1">{errors.gymName.message}</p>}
            </div>
            <div>
              <label className="label">Slug (URL única) *</label>
              <input
                {...register('gymSlug')}
                className="input font-mono text-sm"
                placeholder="fitpro-gym"
              />
              {errors.gymSlug && <p className="text-red-400 text-xs mt-1">{errors.gymSlug.message}</p>}
              <p className="text-xs text-slate-500 mt-1">Solo letras, números y guiones</p>
            </div>
          </div>

          <div>
            <label className="label">Dirección</label>
            <input {...register('address')} className="input" placeholder="Av. Siempreviva 742" />
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h2 className="font-semibold text-slate-300 mb-4">Datos del Administrador</h2>
          </div>

          <div>
            <label className="label">Nombre completo *</label>
            <input {...register('ownerName')} className="input" placeholder="Juan García" />
            {errors.ownerName && <p className="text-red-400 text-xs mt-1">{errors.ownerName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input {...register('email')} type="email" className="input" placeholder="admin@migigim.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input {...register('phone')} className="input" placeholder="+54 11 1234-5678" />
            </div>
          </div>

          <div>
            <label className="label">Contraseña *</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Mín. 8 caracteres con mayúscula y número"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold">
            {loading ? 'Registrando...' : 'Crear gimnasio gratis'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm">
          ¿Ya tenés una cuenta?{' '}
          <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
