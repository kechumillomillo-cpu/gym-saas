import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(gymId: string, memberId: string, method = 'QR') {
    const member = await this.prisma.member.findFirst({ where: { id: memberId, gymId } })
    if (!member) throw new NotFoundException('Alumno no encontrado')
    if (member.status !== 'ACTIVE') throw new BadRequestException('Alumno no activo')

    // Prevent double check-in within 1 hour
    const recent = await this.prisma.attendance.findFirst({
      where: {
        memberId,
        gymId,
        checkedInAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    })
    if (recent) return { ...recent, alreadyCheckedIn: true }

    return this.prisma.attendance.create({
      data: { gymId, memberId, method },
      include: { member: { select: { firstName: true, lastName: true, photoUrl: true } } },
    })
  }

  async checkInByQr(payload: { gymId: string; memberId: string }) {
    return this.checkIn(payload.gymId, payload.memberId, 'QR')
  }

  async checkOut(gymId: string, attendanceId: string) {
    const att = await this.prisma.attendance.findFirst({ where: { id: attendanceId, gymId } })
    if (!att) throw new NotFoundException()
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { checkedOutAt: new Date() },
    })
  }

  async findAll(gymId: string, params: { date?: string; memberId?: string; page?: number; limit?: number }) {
    const { date, memberId, page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const where: any = { gymId }
    if (memberId) where.memberId = memberId
    if (date) {
      const d = new Date(date)
      const dayEnd = new Date(d)
      dayEnd.setHours(23, 59, 59, 999)
      where.checkedInAt = { gte: d, lte: dayEnd }
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkedInAt: 'desc' },
        include: { member: { select: { firstName: true, lastName: true, photoUrl: true } } },
      }),
      this.prisma.attendance.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getTodayCount(gymId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return this.prisma.attendance.count({ where: { gymId, checkedInAt: { gte: today } } })
  }

  async getStats(gymId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const attendances = await this.prisma.attendance.findMany({
      where: { gymId, checkedInAt: { gte: since } },
      select: { checkedInAt: true },
    })

    const byDay: Record<string, number> = {}
    for (const a of attendances) {
      const day = a.checkedInAt.toISOString().split('T')[0]
      byDay[day] = (byDay[day] || 0) + 1
    }

    return { total: attendances.length, byDay, period: days }
  }
}
