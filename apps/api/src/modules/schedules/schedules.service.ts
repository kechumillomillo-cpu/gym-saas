import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async getSlots(gymId: string) {
    return this.prisma.scheduleSlot.findMany({
      where: { gymId, isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
  }

  async createSlot(gymId: string, dto: any) {
    return this.prisma.scheduleSlot.create({ data: { gymId, ...dto } })
  }

  async updateSlot(gymId: string, id: string, dto: any) {
    const slot = await this.prisma.scheduleSlot.findFirst({ where: { id, gymId } })
    if (!slot) throw new NotFoundException()
    return this.prisma.scheduleSlot.update({ where: { id }, data: dto })
  }

  async deleteSlot(gymId: string, id: string) {
    const slot = await this.prisma.scheduleSlot.findFirst({ where: { id, gymId } })
    if (!slot) throw new NotFoundException()
    await this.prisma.scheduleSlot.delete({ where: { id } })
  }

  async getReservations(gymId: string, date?: string) {
    const where: any = { slot: { gymId } }
    if (date) {
      const d = new Date(date)
      const dayEnd = new Date(d)
      dayEnd.setHours(23, 59, 59, 999)
      where.date = { gte: d, lte: dayEnd }
    }

    return this.prisma.reservation.findMany({
      where,
      include: {
        member: { select: { firstName: true, lastName: true } },
        slot: true,
      },
      orderBy: { date: 'asc' },
    })
  }

  async reserve(gymId: string, memberId: string, slotId: string, date: string) {
    const slot = await this.prisma.scheduleSlot.findFirst({ where: { id: slotId, gymId } })
    if (!slot) throw new NotFoundException('Turno no encontrado')

    const existing = await this.prisma.reservation.count({
      where: { slotId, date: new Date(date), status: 'CONFIRMED' },
    })
    if (existing >= slot.capacity) throw new BadRequestException('El turno está completo')

    return this.prisma.reservation.upsert({
      where: { memberId_slotId_date: { memberId, slotId, date: new Date(date) } },
      update: { status: 'CONFIRMED' },
      create: { memberId, slotId, date: new Date(date), status: 'CONFIRMED' },
    })
  }

  async cancelReservation(memberId: string, reservationId: string) {
    const res = await this.prisma.reservation.findFirst({ where: { id: reservationId, memberId } })
    if (!res) throw new NotFoundException()
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    })
  }

  async getHolidays(gymId: string) {
    return this.prisma.holiday.findMany({ where: { gymId }, orderBy: { date: 'asc' } })
  }

  async addHoliday(gymId: string, dto: { date: string; reason?: string }) {
    return this.prisma.holiday.create({ data: { gymId, date: new Date(dto.date), reason: dto.reason } })
  }

  async removeHoliday(gymId: string, id: string) {
    const h = await this.prisma.holiday.findFirst({ where: { id, gymId } })
    if (!h) throw new NotFoundException()
    await this.prisma.holiday.delete({ where: { id } })
  }

  async getOccupancy(gymId: string, weekStart: string) {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    const reservations = await this.prisma.reservation.groupBy({
      by: ['slotId', 'date'],
      where: { slot: { gymId }, date: { gte: start, lt: end }, status: 'CONFIRMED' },
      _count: { id: true },
    })

    const slots = await this.prisma.scheduleSlot.findMany({ where: { gymId } })
    return { slots, reservations }
  }
}
