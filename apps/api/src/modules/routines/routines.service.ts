import { Injectable, NotFoundException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateRoutineDto, UpdateRoutineDto, AssignRoutineDto } from './dto/routine.dto'
import { ROUTINE_EXPIRY_DAYS } from '@gym-saas/shared'

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  async create(gymId: string, dto: CreateRoutineDto) {
    const { exercises, ...routineData } = dto
    const routine = await this.prisma.routine.create({
      data: { gymId, ...routineData },
    })

    if (exercises?.length) {
      await this.prisma.routineExercise.createMany({
        data: exercises.map((e, i) => ({
          routineId: routine.id,
          ...e,
          order: e.order ?? i,
        })),
      })
    }

    return this.findOne(gymId, routine.id)
  }

  async findAll(gymId: string) {
    return this.prisma.routine.findMany({
      where: { gymId },
      include: {
        exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(gymId: string, id: string) {
    const routine = await this.prisma.routine.findFirst({
      where: { id, gymId },
      include: {
        exercises: {
          include: { exercise: { include: { category: true } } },
          orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
        },
      },
    })
    if (!routine) throw new NotFoundException('Rutina no encontrada')
    return routine
  }

  async update(gymId: string, id: string, dto: UpdateRoutineDto) {
    const routine = await this.prisma.routine.findFirst({ where: { id, gymId } })
    if (!routine) throw new NotFoundException()

    const { exercises, ...routineData } = dto
    if (exercises) {
      await this.prisma.routineExercise.deleteMany({ where: { routineId: id } })
      await this.prisma.routineExercise.createMany({
        data: exercises.map((e, i) => ({ routineId: id, ...e, order: e.order ?? i })),
      })
    }

    return this.prisma.routine.update({ where: { id }, data: routineData })
  }

  async remove(gymId: string, id: string) {
    const routine = await this.prisma.routine.findFirst({ where: { id, gymId } })
    if (!routine) throw new NotFoundException()
    await this.prisma.routine.delete({ where: { id } })
  }

  async assign(gymId: string, dto: AssignRoutineDto) {
    const [member, routine] = await Promise.all([
      this.prisma.member.findFirst({ where: { id: dto.memberId, gymId } }),
      this.prisma.routine.findFirst({ where: { id: dto.routineId, gymId } }),
    ])
    if (!member) throw new NotFoundException('Alumno no encontrado')
    if (!routine) throw new NotFoundException('Rutina no encontrada')

    await this.prisma.routineAssign.updateMany({
      where: { memberId: dto.memberId, isActive: true },
      data: { isActive: false },
    })

    const startsAt = new Date()
    const expiresAt = new Date(startsAt.getTime() + ROUTINE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    return this.prisma.routineAssign.create({
      data: { ...dto, startsAt, expiresAt, isActive: true },
      include: { routine: true, member: true },
    })
  }

  async getExpiringSoon(gymId: string, days = 7) {
    const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    return this.prisma.routineAssign.findMany({
      where: {
        isActive: true,
        expiresAt: { lte: cutoff, gte: new Date() },
        member: { gymId },
      },
      include: {
        member: { select: { firstName: true, lastName: true, email: true, whatsapp: true } },
        routine: { select: { name: true } },
      },
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async autoRenewExpiredRoutines() {
    const expired = await this.prisma.routineAssign.findMany({
      where: { isActive: true, expiresAt: { lt: new Date() } },
    })

    for (const assign of expired) {
      const startsAt = new Date()
      const expiresAt = new Date(startsAt.getTime() + ROUTINE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      await this.prisma.routineAssign.update({
        where: { id: assign.id },
        data: { renewedAt: startsAt, expiresAt, startsAt },
      })
    }
  }

  async getMemberRoutine(memberId: string) {
    return this.prisma.routineAssign.findFirst({
      where: { memberId, isActive: true },
      include: {
        routine: {
          include: {
            exercises: {
              include: { exercise: { include: { category: true } } },
              orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
            },
          },
        },
      },
    })
  }
}
