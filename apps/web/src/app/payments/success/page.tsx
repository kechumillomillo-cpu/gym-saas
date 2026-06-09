'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')

  return (
    <div className="max-w-md w-full text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-green-400/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-14 h-14 text-green-400" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">¡Pago exitoso!</h1>
        <p className="text-slate-400">Tu pago fue procesado correctamente por Mercado Pago.</p>
        {paymentId && (
          <p className="text-xs text-slate-500 mt-2">ID de pago: {paymentId}</p>
        )}
      </div>
      <div className="card text-left">
        <p className="text-sm text-slate-300">Tu membresía ha sido renovada. Podés verla en tu perfil.</p>
      </div>
      <Link href="/app/payments" className="btn-primary block py-3 text-center rounded-xl">
        Ver mis pagos
      </Link>
      <Link href="/app" className="text-sm text-slate-400 hover:text-white block">
        Volver al inicio
      </Link>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-24 h-24 bg-green-400/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-14 h-14 text-green-400 animate-pulse" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
