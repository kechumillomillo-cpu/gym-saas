import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="text-8xl font-bold text-primary-500">404</p>
        <h1 className="text-2xl font-bold text-white">Página no encontrada</h1>
        <p className="text-slate-400">La página que buscás no existe o fue movida.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/dashboard" className="btn-primary py-2 px-4">
            Ir al dashboard
          </Link>
          <Link href="/app" className="btn-secondary py-2 px-4">
            Portal de socios
          </Link>
        </div>
      </div>
    </div>
  )
}
