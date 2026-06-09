'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { membersApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

const schema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  dni: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
  password: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSuccess: () => void
  onCancel: () => void
  defaultValues?: Partial<FormData>
  memberId?: string
}

export function MemberForm({ onSuccess, onCancel, defaultValues, memberId }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = async (data: FormData) => {
    try {
      if (memberId) {
        await membersApi.update(memberId, data)
        toast.success('Alumno actualizado')
      } else {
        await membersApi.create(data)
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar')
    }
  }

  return (
    <div className="card border border-primary-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{memberId ? 'Editar alumno' : 'Nuevo alumno'}</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre *</label>
            <input {...register('firstName')} className="input" placeholder="Carlos" />
            {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="label">Apellido *</label>
            <input {...register('lastName')} className="input" placeholder="González" />
            {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <label className="label">DNI</label>
            <input {...register('dni')} className="input" placeholder="30123456" />
          </div>
          <div>
            <label className="label">Fecha de nacimiento</label>
            <input {...register('birthDate')} type="date" className="input" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input {...register('phone')} className="input" placeholder="+54 9 11..." />
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input {...register('whatsapp')} className="input" placeholder="+5491123456789" />
          </div>
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="carlos@email.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Dirección</label>
            <input {...register('address')} className="input" placeholder="Av. Corrientes 1234" />
          </div>
          <div>
            <label className="label">Contacto de emergencia</label>
            <input {...register('emergencyContact')} className="input" placeholder="Nombre" />
          </div>
          <div>
            <label className="label">Teléfono emergencia</label>
            <input {...register('emergencyPhone')} className="input" placeholder="+54 9 11..." />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notas médicas</label>
            <textarea {...register('medicalNotes')} className="input" rows={2} placeholder="Lesiones, condiciones a tener en cuenta..." />
          </div>
          {!memberId && (
            <div>
              <label className="label">Contraseña (para acceso app)</label>
              <input {...register('password')} type="password" className="input" placeholder="Mínimo 8 caracteres" />
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : memberId ? 'Actualizar' : 'Crear alumno'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
