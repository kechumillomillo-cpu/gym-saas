import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

export class CreateBodyMetricDto {
  memberId: string
  weight?: number
  height?: number
  bodyFat?: number
  muscleMass?: number
  waist?: number
  chest?: number
  hip?: number
  arm?: number
  thigh?: number
  notes?: string
}

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}

  async createMetric(gymId: string, dto: CreateBodyMetricDto) {
    const member = await this.prisma.member.findFirst({ where: { id: dto.memberId, gymId } })
    if (!member) throw new NotFoundException()

    const bmi = dto.weight && dto.height ? dto.weight / Math.pow(dto.height / 100, 2) : undefined

    return this.prisma.bodyMetric.create({
      data: { ...dto, bmi: bmi ? Math.round(bmi * 10) / 10 : undefined },
    })
  }

  async getMetrics(gymId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({ where: { id: memberId, gymId } })
    if (!member) throw new NotFoundException()

    return this.prisma.bodyMetric.findMany({
      where: { memberId },
      orderBy: { recordedAt: 'desc' },
    })
  }

  async getLatestMetric(gymId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({ where: { id: memberId, gymId } })
    if (!member) throw new NotFoundException()

    return this.prisma.bodyMetric.findFirst({ where: { memberId }, orderBy: { recordedAt: 'desc' } })
  }

  async addProgressPhoto(gymId: string, memberId: string, url: string, angle: string, notes?: string) {
    const member = await this.prisma.member.findFirst({ where: { id: memberId, gymId } })
    if (!member) throw new NotFoundException()
    return this.prisma.progressPhoto.create({ data: { memberId, url, angle, notes } })
  }

  async getProgressPhotos(gymId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({ where: { id: memberId, gymId } })
    if (!member) throw new NotFoundException()
    return this.prisma.progressPhoto.findMany({ where: { memberId }, orderBy: { takenAt: 'desc' } })
  }
}
