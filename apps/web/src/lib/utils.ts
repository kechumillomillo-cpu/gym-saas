import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('es-AR', opts || { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(date),
  )
}

export function formatRelative(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays <= 7) return `En ${diffDays} días`
  return formatDate(d)
}

export function getDaysUntil(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'text-green-400 bg-green-400/10',
    INACTIVE: 'text-slate-400 bg-slate-400/10',
    SUSPENDED: 'text-orange-400 bg-orange-400/10',
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    PAID: 'text-green-400 bg-green-400/10',
    OVERDUE: 'text-red-400 bg-red-400/10',
    CANCELLED: 'text-slate-400 bg-slate-400/10',
  }
  return map[status] || 'text-slate-400 bg-slate-400/10'
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    SUSPENDED: 'Suspendido',
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    OVERDUE: 'Vencido',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    MERCADO_PAGO: 'Mercado Pago',
  }
  return map[status] || status
}
