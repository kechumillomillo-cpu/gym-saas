'use client'
import { Clock } from 'lucide-react'
import Link from 'next/link'

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-orange-400/10 rounded-full flex items-center justify-center">
            <Clock className="w-14 h-14 text-orange-400" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Pago pendiente</h1>
          <p className="text-slate-400">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
        </div>
        <div className="card text-left text-sm text-slate-300">
          <p>Si pagaste en efectivo (OXXO, Rapipago, etc.), la acreditación puede demorar hasta 2 días hábiles.</p>
        </div>
        <Link href="/app/payments" className="btn-primary block py-3 text-center rounded-xl">
          Ver mis pagos
        </Link>
        <Link href="/app" className="text-sm text-slate-400 hover:text-white block">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
