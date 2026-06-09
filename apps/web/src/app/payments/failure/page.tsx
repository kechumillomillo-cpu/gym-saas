'use client'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-400/10 rounded-full flex items-center justify-center">
            <XCircle className="w-14 h-14 text-red-400" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Pago fallido</h1>
          <p className="text-slate-400">Tu pago no pudo ser procesado. Podés intentarlo nuevamente.</p>
        </div>
        <div className="card text-left space-y-2 text-sm text-slate-300">
          <p>Posibles causas:</p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>Fondos insuficientes</li>
            <li>Datos de tarjeta incorrectos</li>
            <li>Límite de compras superado</li>
            <li>Problema temporal con el banco</li>
          </ul>
        </div>
        <Link href="/app/payments" className="btn-primary block py-3 text-center rounded-xl">
          Intentar nuevamente
        </Link>
        <Link href="/app" className="text-sm text-slate-400 hover:text-white block">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
