import { cn } from '@/lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variants: Record<Variant, string> = {
  default: 'bg-slate-700 text-slate-300',
  success: 'bg-green-400/10 text-green-400',
  warning: 'bg-orange-400/10 text-orange-400',
  danger: 'bg-red-400/10 text-red-400',
  info: 'bg-blue-400/10 text-blue-400',
}

export function Badge({ children, variant = 'default', className }: {
  children: React.ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
