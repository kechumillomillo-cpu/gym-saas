import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(gymId: string) {
    return this.prisma.user.findMany({
      where: { gymId },
      select: { id: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createUser(gymId: string, dto: { email: string; password: string; role: string }) {
    const passwordHash = await bcrypt.hash(dto.password, 12)
    return this.prisma.user.create({
      data: { gymId, email: dto.email, passwordHash, role: dto.role as any },
      select: { id: true, email: true, role: true, isActive: true },
    })
  }

  async updateUserRole(gymId: string, userId: string, role: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, gymId } })
    if (!user) throw new NotFoundException()
    if (user.role === 'OWNER') throw new ForbiddenException('No se puede cambiar el rol del dueño')
    return this.prisma.user.update({ where: { id: userId }, data: { role: role as any } })
  }

  async deactivateUser(gymId: string, userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, gymId } })
    if (!user) throw new NotFoundException()
    return this.prisma.user.update({ where: { id: userId }, data: { isActive: false } })
  }

  async getAuditLogs(gymId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { user: { gymId } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where: { user: { gymId } } }),
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async updateGymSettings(gymId: string, dto: any) {
    return this.prisma.gym.update({ where: { id: gymId }, data: dto })
  }

  async getGym(gymId: string) {
    return this.prisma.gym.findUnique({ where: { id: gymId } })
  }

  async getAnnouncements(gymId: string) {
    return this.prisma.announcement.findMany({ where: { gymId, isActive: true }, orderBy: { publishedAt: 'desc' } })
  }

  async createAnnouncement(gymId: string, dto: { title: string; body: string; imageUrl?: string; expiresAt?: string }) {
    return this.prisma.announcement.create({
      data: { gymId, ...dto, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined },
    })
  }
}
