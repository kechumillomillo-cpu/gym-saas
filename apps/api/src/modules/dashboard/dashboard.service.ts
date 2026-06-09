import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { DashboardStats } from '@gym-saas/shared'

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(gymId: string): Promise<DashboardStats> {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const todayStart = new Date(now.setHours(0, 0, 0, 0))

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      monthRevenue,
      pendingPayments,
      overduePayments,
      routinesExpiring,
      attendancesToday,
      reservationsToday,
      revenueLastMonth,
      newMembersThisMonth,
    ] = await Promise.all([
      this.prisma.member.count({ where: { gymId } }),
      this.prisma.member.count({ where: { gymId, status: 'ACTIVE' } }),
      this.prisma.member.count({ where: { gymId, status: 'INACTIVE' } }),
      this.prisma.payment.aggregate({
        where: { gymId, status: 'PAID', paidAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({ where: { gymId, status: 'PENDING' } }),
      this.prisma.payment.count({ where: { gymId, status: 'OVERDUE' } }),
      this.prisma.routineAssign.count({
        where: { isActive: true, expiresAt: { lte: weekFromNow, gte: new Date() }, member: { gymId } },
      }),
      this.prisma.attendance.count({ where: { gymId, checkedInAt: { gte: todayStart } } }),
      this.prisma.reservation.count({
        where: { slot: { gymId }, date: { gte: todayStart }, status: 'CONFIRMED' },
      }),
      this.prisma.payment.aggregate({
        where: {
          gymId,
          status: 'PAID',
          paidAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: monthStart,
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.member.count({ where: { gymId, joinedAt: { gte: monthStart } } }),
    ])

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      monthlyRevenue: Number(monthRevenue._sum.amount || 0),
      pendingPayments,
      overduePayments,
      routinesExpiringSoon: routinesExpiring,
      attendancesToday,
      reservationsToday,
      revenueLastMonth: Number(revenueLastMonth._sum.amount || 0),
      newMembersThisMonth,
    }
  }

  async getRecentActivity(gymId: string) {
    const [recentPayments, recentAttendances, recentMembers] = await Promise.all([
      this.prisma.payment.findMany({
        where: { gymId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { member: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.attendance.findMany({
        where: { gymId },
        orderBy: { checkedInAt: 'desc' },
        take: 5,
        include: { member: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.member.findMany({
        where: { gymId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, createdAt: true, status: true },
      }),
    ])

    return { recentPayments, recentAttendances, recentMembers }
  }

  async getUpcomingExpiries(gymId: string) {
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const [paymentsDue, routinesExpiring] = await Promise.all([
      this.prisma.payment.findMany({
        where: { gymId, status: 'PENDING', dueDate: { lte: weekFromNow, gte: new Date() } },
        orderBy: { dueDate: 'asc' },
        include: { member: { select: { firstName: true, lastName: true } } },
        take: 10,
      }),
      this.prisma.routineAssign.findMany({
        where: { isActive: true, expiresAt: { lte: weekFromNow, gte: new Date() }, member: { gymId } },
        orderBy: { expiresAt: 'asc' },
        include: {
          member: { select: { firstName: true, lastName: true } },
          routine: { select: { name: true } },
        },
        take: 10,
      }),
    ])

    return { paymentsDue, routinesExpiring }
  }

  async getRevenueChart(gymId: string, months = 6) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const result = await this.prisma.payment.aggregate({
        where: { gymId, status: 'PAID', paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: { id: true },
      })

      data.push({
        month: start.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
        revenue: Number(result._sum.amount || 0),
        payments: result._count.id,
      })
    }

    return data
  }
}
