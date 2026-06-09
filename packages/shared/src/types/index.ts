export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'TRAINER' | 'RECEPTIONIST' | 'MEMBER'
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MERCADO_PAGO' | 'OTHER'
export type GymPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
export type NotificationType = 'PAYMENT_DUE' | 'PAYMENT_OVERDUE' | 'ROUTINE_EXPIRING' | 'ROUTINE_RENEWED' | 'RESERVATION_CONFIRMED' | 'RESERVATION_CANCELLED' | 'ANNOUNCEMENT' | 'WELCOME' | 'CUSTOM'
export type NotificationChannel = 'EMAIL' | 'WHATSAPP' | 'PUSH' | 'SMS'
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export interface JwtPayload {
  sub: string
  email: string
  gymId: string
  role: UserRole
  gymSlug: string
  iat?: number
  exp?: number
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  monthlyRevenue: number
  pendingPayments: number
  overduePayments: number
  routinesExpiringSoon: number
  attendancesToday: number
  reservationsToday: number
  revenueLastMonth: number
  newMembersThisMonth: number
}
