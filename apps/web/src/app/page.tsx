'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStoredTokens } from '@/lib/auth'
import {
  Dumbbell, Users, CreditCard, Calendar, Smartphone,
  BarChart3, Bell, CheckCircle, ArrowRight, Menu, X, Zap, Shield, Clock,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Users,
    title: 'Gestión de socios',
    desc: 'Ficha completa con foto, DNI, contacto de emergencia, historial de pagos y métricas corporales.',
  },
  {
    icon: CreditCard,
    title: 'Cobros y Mercado Pago',
    desc: 'Registrá pagos en efectivo, transferencia o tarjeta. Aceptá pagos online con Mercado Pago integrado.',
  },
  {
    icon: Dumbbell,
    title: 'Rutinas personalizadas',
    desc: 'Creá y asigná rutinas con más de 100 ejercicios precargados. Tus socios las ven desde su app.',
  },
  {
    icon: Calendar,
    title: 'Horarios y reservas',
    desc: 'Configurá clases y turnos. Tus socios reservan su lugar desde el celular sin llamar.',
  },
  {
    icon: Smartphone,
    title: 'App para socios',
    desc: 'PWA instalable en iPhone y Android sin pasar por la App Store. Rutina, pagos y horarios en su bolsillo.',
  },
  {
    icon: BarChart3,
    title: 'Reportes en tiempo real',
    desc: 'Ingresos del mes, retención de socios, asistencia diaria y deudores en un solo tablero.',
  },
  {
    icon: Bell,
    title: 'Notificaciones automáticas',
    desc: 'Recordatorios de vencimiento de cuota por push y email. Nunca más perseguir a nadie por teléfono.',
  },
  {
    icon: Shield,
    title: 'Multi-rol y seguridad',
    desc: 'Asigná roles de Admin, Recepcionista o Entrenador. Cada uno ve solo lo que necesita.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: 'Gratis',
    period: '30 días de prueba',
    color: 'border-slate-600',
    badge: null,
    features: [
      'Hasta 50 socios',
      'Gestión de pagos manual',
      'Rutinas y ejercicios',
      'Horarios y asistencia',
      'App para socios (PWA)',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    ctaStyle: 'btn-secondary',
  },
  {
    name: 'Professional',
    price: '$15.000',
    period: 'por mes + IVA',
    color: 'border-primary-500',
    badge: 'Más popular',
    features: [
      'Socios ilimitados',
      'Mercado Pago integrado',
      'Notificaciones push y email',
      'Métricas corporales',
      'Reportes avanzados',
      'Soporte prioritario',
    ],
    cta: 'Elegir Professional',
    ctaStyle: 'btn-primary',
  },
  {
    name: 'Enterprise',
    price: '$35.000',
    period: 'por mes + IVA',
    color: 'border-slate-600',
    badge: null,
    features: [
      'Todo lo de Professional',
      'Multi-sede',
      'API acceso completo',
      'Onboarding asistido',
      'SLA garantizado',
      'Factura A',
    ],
    cta: 'Contactar ventas',
    ctaStyle: 'btn-secondary',
  },
]

const STATS = [
  { value: '100+', label: 'ejercicios precargados' },
  { value: '< 5 min', label: 'setup inicial' },
  { value: '0', label: 'comisiones sobre pagos' },
  { value: '24/7', label: 'acceso desde el celular' },
]

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const { accessToken } = getStoredTokens()
    if (accessToken) {
      router.replace('/dashboard')
    } else {
      setChecking(false)
    }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800/80 bg-dark-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">GymSaaS</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Funciones</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Precios</a>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Ingresar</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Crear mi gimnasio
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-dark-950 px-4 py-4 flex flex-col gap-4">
            <a href="#features" className="text-sm text-slate-300" onClick={() => setMenuOpen(false)}>Funciones</a>
            <a href="#pricing" className="text-sm text-slate-300" onClick={() => setMenuOpen(false)}>Precios</a>
            <Link href="/login" className="text-sm text-slate-300">Ingresar</Link>
            <Link href="/register" className="btn-primary text-sm text-center py-2.5">Crear mi gimnasio</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Gestión completa para tu gimnasio
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            El software que tu{' '}
            <span className="text-gradient">gimnasio necesitaba</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Gestioná socios, cobros, rutinas y horarios desde un solo lugar.
            Tus socios tienen su propia app. Vos tenés el control total.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3 w-full sm:w-auto justify-center">
              Crear mi gimnasio gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary flex items-center gap-2 text-base px-6 py-3 w-full sm:w-auto justify-center">
              Ya tengo cuenta
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500">Sin tarjeta de crédito · 30 días gratis · Cancelás cuando querés</p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 px-4 border-y border-slate-800/60">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-primary-500 mb-1">{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Todo lo que necesitás en un lugar</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Diseñado específicamente para gimnasios. Sin funciones de más, sin complicaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="card hover:border-slate-600 transition-colors group">
                <div className="w-10 h-10 bg-primary-500/15 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/25 transition-colors">
                  <f.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBER APP HIGHLIGHT */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              <Smartphone className="w-3.5 h-3.5" />
              App para socios incluida
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">
              Tus socios tienen su propia app mobile
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Se instala como una app nativa en iPhone y Android directo desde el navegador,
              sin pasar por la App Store. Cada socio accede a su rutina, reserva clases y ve
              sus pagos en segundos.
            </p>
            <ul className="space-y-3">
              {[
                'Ver y seguir su rutina personalizada',
                'Reservar clases y turnos online',
                'Historial de pagos y vencimientos',
                'Recibir notificaciones push del gimnasio',
                'Actualizar sus datos y contraseña',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-3">
            <div className="w-64 rounded-2xl border border-slate-700/60 bg-dark-800 overflow-hidden shadow-2xl">
              <div className="bg-dark-900 px-4 py-3 flex items-center gap-2 border-b border-slate-700/50">
                <div className="w-6 h-6 bg-primary-500 rounded-md flex items-center justify-center">
                  <Dumbbell className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold">GymSaaS</span>
                <Clock className="w-3 h-3 text-slate-500 ml-auto" />
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                  <div className="text-xs text-primary-400 font-medium mb-1">Mi rutina hoy</div>
                  <div className="text-sm font-semibold">Fuerza A — 4 ejercicios</div>
                </div>
                {['Press Banca 4×8', 'Sentadilla 4×6', 'Remo 3×10'].map(ex => (
                  <div key={ex} className="flex items-center gap-2 text-xs text-slate-400 py-1.5 border-b border-slate-700/40 last:border-0">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    {ex}
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <div className="bg-dark-900 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Próximo vencimiento</div>
                  <div className="text-sm font-semibold text-yellow-400">15 jun · $12.000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Precios simples y transparentes</h2>
            <p className="text-slate-400 text-lg">Sin costos ocultos. Sin comisiones sobre tus cobros.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`card flex flex-col border-2 ${plan.color} relative ${plan.badge ? 'ring-1 ring-primary-500/30' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    {plan.price !== 'Gratis' && <span className="text-slate-400 text-sm mb-1">/mes</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{plan.period}</div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.name === 'Enterprise' ? (
                  <a
                    href="mailto:ventas@gymsaas.app"
                    className={`${plan.ctaStyle} text-center py-2.5 rounded-lg font-medium text-sm transition-colors`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link href="/register" className={`${plan.ctaStyle} text-center py-2.5 rounded-lg font-medium text-sm transition-colors block`}>
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card border-primary-500/30 bg-gradient-to-b from-primary-500/10 to-dark-800 p-10 sm:p-14">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Empezá tu prueba gratuita hoy
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Tu gimnasio configurado y funcionando en menos de 5 minutos.
              Sin tarjeta de crédito. Sin compromisos.
            </p>
            <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              Crear mi gimnasio gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-4 text-xs text-slate-500">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
                Iniciá sesión acá
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-500 rounded-md flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">GymSaaS</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} GymSaaS. Hecho en Argentina 🇦🇷</p>
          <div className="flex gap-5">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Ingresar</Link>
            <Link href="/register" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
