import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getBilling(gymId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const payments = await this.prisma.payment.findMany({
      where: { gymId, paidAt: { gte: start, lte: end } },
      include: { member: { select: { firstName: true, lastName: true } }, plan: true },
    })

    const total = payments.reduce((s, p) => s + Number(p.amount), 0)
    const byMethod = payments.reduce((acc: any, p) => {
      acc[p.method] = (acc[p.method] || 0) + Number(p.amount)
      return acc
    }, {})

    return { payments, total, byMethod, month, year }
  }

  async getMemberRetention(gymId: string) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [totalActive, newThisMonth, retainedFromLast] = await Promise.all([
      this.prisma.member.count({ where: { gymId, status: 'ACTIVE' } }),
      this.prisma.member.count({ where: { gymId, joinedAt: { gte: thirtyDaysAgo } } }),
      this.prisma.member.count({
        where: {
          gymId,
          status: 'ACTIVE',
          joinedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ])

    const retentionRate = retainedFromLast > 0 ? Math.round((totalActive / retainedFromLast) * 100) : 0

    return { totalActive, newThisMonth, retainedFromLast, retentionRate }
  }

  async getActiveVsInactive(gymId: string) {
    const [active, inactive, suspended, pending] = await Promise.all([
      this.prisma.member.count({ where: { gymId, status: 'ACTIVE' } }),
      this.prisma.member.count({ where: { gymId, status: 'INACTIVE' } }),
      this.prisma.member.count({ where: { gymId, status: 'SUSPENDED' } }),
      this.prisma.member.count({ where: { gymId, status: 'PENDING' } }),
    ])
    const total = active + inactive + suspended + pending
    return { active, inactive, suspended, pending, total }
  }

  async getAttendanceReport(gymId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const attendances = await this.prisma.attendance.findMany({
      where: { gymId, checkedInAt: { gte: since } },
      include: { member: { select: { firstName: true, lastName: true } } },
      orderBy: { checkedInAt: 'desc' },
    })

    const byMember = attendances.reduce((acc: any, a) => {
      const key = `${a.member.firstName} ${a.member.lastName}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const byDay = attendances.reduce((acc: any, a) => {
      const day = a.checkedInAt.toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})

    return { total: attendances.length, byMember, byDay, period: days }
  }
}
