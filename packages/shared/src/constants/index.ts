export const ROLES_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  OWNER: 80,
  ADMIN: 60,
  TRAINER: 40,
  RECEPTIONIST: 20,
  MEMBER: 10,
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido',
  PENDING: 'Pendiente',
}

export const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const ROUTINE_EXPIRY_DAYS = 90
export const ROUTINE_WARNING_DAYS = 7
export const PAYMENT_WARNING_DAYS = [7, 3, 1]
