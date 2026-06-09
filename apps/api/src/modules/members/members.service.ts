import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import * as QRCode from 'qrcode'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateMemberDto, UpdateMemberDto, MemberQueryDto } from './dto/member.dto'

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(gymId: string, dto: CreateMemberDto) {
    if (dto.email) {
      const existing = await this.prisma.member.findFirst({ where: { gymId, email: dto.email } })
      if (existing) throw new ConflictException('Ya existe un alumno con ese email')
    }

    let userId: string | undefined
    if (dto.email && dto.password) {
      const existingUser = await this.prisma.user.findUnique({
        where: { gymId_email: { gymId, email: dto.email } },
      })
      if (!existingUser) {
        const passwordHash = await bcrypt.hash(dto.password, 12)
        const user = await this.prisma.user.create({
          data: { gymId, email: dto.email, passwordHash, role: 'MEMBER' },
        })
        userId = user.id
      } else {
        userId = existingUser.id
      }
    }

    const { password, ...memberData } = dto
    return this.prisma.member.create({
      data: { gymId, ...memberData, userId, birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined },
      include: { user: { select: { email: true, role: true } } },
    })
  }

  async findAll(gymId: string, query: MemberQueryDto) {
    const { search, status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: any = { gymId }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payments: {
            where: { status: { in: ['PAID', 'PENDING'] } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          routineAssigns: {
            where: { isActive: true },
            include: { routine: { select: { name: true } } },
            take: 1,
          },
        },
      }),
      this.prisma.member.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(gymId: string, id: string) {
    const member = await this.prisma.member.findFirst({
      where: { id, gymId },
      include: {
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        routineAssigns: {
          include: { routine: { include: { exercises: { include: { exercise: true } } } } },
          orderBy: { assignedAt: 'desc' },
        },
        attendances: { orderBy: { checkedInAt: 'desc' }, take: 20 },
        bodyMetrics: { orderBy: { recordedAt: 'desc' }, take: 5 },
        progressPhotos: { orderBy: { takenAt: 'desc' } },
      },
    })
    if (!member) throw new NotFoundException('Alumno no encontrado')
    return member
  }

  async update(gymId: string, id: string, dto: UpdateMemberDto) {
    const member = await this.prisma.member.findFirst({ where: { id, gymId } })
    if (!member) throw new NotFoundException('Alumno no encontrado')

    return this.prisma.member.update({
      where: { id },
      data: { ...dto, birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined },
    })
  }

  async remove(gymId: string, id: string) {
    const member = await this.prisma.member.findFirst({ where: { id, gymId } })
    if (!member) throw new NotFoundException('Alumno no encontrado')

    await this.prisma.member.update({ where: { id }, data: { status: 'INACTIVE' } })
  }

  async generateQr(gymId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({ where: { id: memberId, gymId } })
    if (!member) throw new NotFoundException()

    const data = JSON.stringify({ gymId, memberId, type: 'attendance' })
    const qrDataUrl = await QRCode.toDataURL(data, { width: 300, margin: 2 })
    return { qrDataUrl, memberId, gymId }
  }

  async getHistory(gymId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({ where: { id: memberId, gymId } })
    if (!member) throw new NotFoundException()

    const [payments, routines, attendances] = await Promise.all([
      this.prisma.payment.findMany({
        where: { memberId },
        orderBy: { createdAt: 'desc' },
        include: { plan: true },
      }),
      this.prisma.routineAssign.findMany({
        where: { memberId },
        orderBy: { assignedAt: 'desc' },
        include: { routine: { select: { name: true, goal: true } } },
      }),
      this.prisma.attendance.findMany({
        where: { memberId },
        orderBy: { checkedInAt: 'desc' },
        take: 50,
      }),
    ])

    return { member, payments, routines, attendances }
  }
}
