'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { routinesApi, exercisesApi } from '@/lib/api'
import { PageSpinner } from '@/components/ui/Spinner'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

interface ExerciseEntry {
  exerciseId: string
  day: number
  sets: number
  reps: number
  weight?: number
  restSeconds?: number
  notes?: string
}

interface FormData {
  name: string
  description?: string
  exercises: ExerciseEntry[]
}

export default function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeDay, setActiveDay] = useState(0)

  const { data: routineRes, isLoading } = useQuery({
    queryKey: ['routine', id],
    queryFn: () => routinesApi.get(id),
  })
  const routine = routineRes?.data

  const { data: exercisesRes } = useQuery({
    queryKey: ['exercises', { limit: 200 }],
    queryFn: () => exercisesApi.list({ limit: 200 }),
  })
  const exercisesData = exercisesRes?.data

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', exercises: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' })

  useEffect(() => {
    if (routine) {
      reset({
        name: routine.name,
        description: routine.description ?? '',
        exercises: (routine.exercises ?? []).map((e: any) => ({
          exerciseId: e.exerciseId,
          day: e.day,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight ?? '',
          restSeconds: e.restSeconds ?? 60,
          notes: e.notes ?? '',
        })),
      })
    }
  }, [routine, reset])

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => routinesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine', id] })
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      toast.success('Rutina actualizada')
      router.push(`/routines/${id}`)
    },

    onError: () => toast.error('Error al actualizar'),
  })

  const exercises = exercisesData?.data ?? exercisesData ?? []
  const watchedExercises = watch('exercises')
  const dayExercises = fields.filter((_, i) => watchedExercises[i]?.day === activeDay)

  function addExercise() {
    append({ exerciseId: '', day: activeDay, sets: 3, reps: 12, weight: undefined, restSeconds: 60, notes: '' })
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/routines/${id}`} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Rutina</h1>
          <p className="text-slate-400 text-sm">{routine?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold">Información General</h2>
          <div>
            <label className="label">Nombre *</label>
            <input
              {...register('name', { required: 'El nombre es requerido' })}
              className="input"
              placeholder="ej. Rutina Full Body 3x"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea
              {...register('description')}
              className="input resize-none h-20"
              placeholder="Descripción opcional de la rutina..."
            />
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Ejercicios por Día</h2>
            <button type="button" onClick={addExercise} className="btn-primary flex items-center gap-2 py-1.5 text-sm">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2">
            {DAYS.map((day, i) => {
              const count = watchedExercises.filter(e => e?.day === i).length
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeDay === i ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {day.slice(0, 3)} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {fields.map((field, i) => {
              if (watchedExercises[i]?.day !== activeDay) return null
              return (
                <div key={field.id} className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Ejercicio {i + 1}</span>
                    <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className="label">Ejercicio *</label>
                    <select {...register(`exercises.${i}.exerciseId`, { required: true })} className="input">
                      <option value="">Seleccionar...</option>
                      {exercises.map((ex: any) => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="label">Series</label>
                      <input type="number" {...register(`exercises.${i}.sets`, { valueAsNumber: true, min: 1 })} className="input" min={1} />
                    </div>
                    <div>
                      <label className="label">Reps</label>
                      <input type="number" {...register(`exercises.${i}.reps`, { valueAsNumber: true, min: 1 })} className="input" min={1} />
                    </div>
                    <div>
                      <label className="label">Peso (kg)</label>
                      <input type="number" {...register(`exercises.${i}.weight`, { valueAsNumber: true })} className="input" placeholder="Opcional" />
                    </div>
                    <div>
                      <label className="label">Descanso (s)</label>
                      <input type="number" {...register(`exercises.${i}.restSeconds`, { valueAsNumber: true })} className="input" defaultValue={60} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Notas</label>
                    <input {...register(`exercises.${i}.notes`)} className="input" placeholder="Opcional..." />
                  </div>
                </div>
              )
            })}
            {dayExercises.length === 0 && (
              <p className="text-center text-slate-500 py-6 text-sm">
                Sin ejercicios para {DAYS[activeDay]}. Haz clic en "Agregar".
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href={`/routines/${id}`} className="btn-secondary py-2 px-4 text-sm">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
