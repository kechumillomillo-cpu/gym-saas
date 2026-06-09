import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../common/prisma/prisma.service'
import { EmailProvider } from './providers/email.provider'
import { WhatsappProvider } from './providers/whatsapp.provider'
import { ConfigService } from '@nestjs/config'
import { PAYMENT_WARNING_DAYS, ROUTINE_WARNING_DAYS } from '@gym-saas/shared'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private prisma: PrismaService,
    private email: EmailProvider,
    private whatsapp: WhatsappProvider,
    private config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async processPaymentReminders() {
    this.logger.log('Processing payment reminders...')

    for (const daysLeft of PAYMENT_WARNING_DAYS) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + daysLeft)
      const dayStart = new Date(targetDate.setHours(0, 0, 0, 0))
      const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999))

      const payments = await this.prisma.payment.findMany({
        where: {
          status: 'PENDING',
          dueDate: { gte: dayStart, lte: dayEnd },
        },
        include: {
          member: true,
          gym: true,
        },
      })

      for (const payment of payments) {
        await this.sendPaymentReminder(payment as any, daysLeft)
      }
    }

    // Overdue payments
    const overdue = await this.prisma.payment.findMany({
      where: { status: 'PENDING', dueDate: { lt: new Date() } },
      include: { member: true, gym: true },
    })

    for (const payment of overdue) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'OVERDUE' } })
      await this.sendOverdueNotification(payment as any)
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async processRoutineReminders() {
    const cutoff = new Date(Date.now() + ROUTINE_WARNING_DAYS * 24 * 60 * 60 * 1000)
    const expiring = await this.prisma.routineAssign.findMany({
      where: { isActive: true, expiresAt: { lte: cutoff, gte: new Date() } },
      include: { member: true, routine: true },
    })

    for (const assign of expiring) {
      const daysLeft = Math.ceil((assign.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      const gym = await this.prisma.gym.findUnique({ where: { id: assign.member.gymId } })
      if (!gym) continue

      if (assign.member.whatsapp) {
        const msg = this.whatsapp.routineExpiringMessage(
          assign.member.firstName,
          assign.routine.name,
          daysLeft,
          gym.name,
        )
        await this.whatsapp.send(assign.member.whatsapp, msg)
      }

      await this.prisma.notification.create({
        data: {
          gymId: gym.id,
          memberId: assign.memberId,
          type: 'ROUTINE_EXPIRING',
          channel: 'WHATSAPP',
          title: 'Rutina próxima a vencer',
          body: `Tu rutina "${assign.routine.name}" vence en ${daysLeft} días`,
          status: 'SENT',
          sentAt: new Date(),
        },
      })
    }
  }

  async sendWelcome(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { gym: true },
    })
    if (!member) return

    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000'

    if (member.whatsapp) {
      const msg = this.whatsapp.welcomeMessage(member.firstName, member.gym.name)
      await this.whatsapp.send(member.whatsapp, msg)
    }

    if (member.email) {
      const html = this.email.buildWelcomeEmail(
        member.firstName,
        member.gym.name,
        `${frontendUrl}/${member.gym.slug}/login`,
      )
      await this.email.send(member.email, `¡Bienvenido a ${member.gym.name}!`, html)
    }

    await this.prisma.notification.create({
      data: {
        gymId: member.gymId,
        memberId,
        type: 'WELCOME',
        channel: 'EMAIL',
        title: 'Bienvenida',
        body: `Bienvenido ${member.firstName} a ${member.gym.name}`,
        status: 'SENT',
        sentAt: new Date(),
      },
    })
  }

  async sendCustom(gymId: string, dto: { memberId?: string; title: string; body: string; channels: string[] }) {
    const gym = await this.prisma.gym.findUnique({ where: { id: gymId } })
    if (!gym) return

    let members: any[] = []
    if (dto.memberId) {
      const m = await this.prisma.member.findFirst({ where: { id: dto.memberId, gymId } })
      if (m) members = [m]
    } else {
      members = await this.prisma.member.findMany({ where: { gymId, status: 'ACTIVE' } })
    }

    for (const member of members) {
      if (dto.channels.includes('WHATSAPP') && member.whatsapp) {
        await this.whatsapp.send(member.whatsapp, `*${dto.title}*\n\n${dto.body}`)
      }
      if (dto.channels.includes('EMAIL') && member.email) {
        await this.email.send(member.email, dto.title, `<h2>${dto.title}</h2><p>${dto.body}</p>`)
      }
    }
  }

  async findAll(gymId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { gymId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { gymId } }),
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  private async sendPaymentReminder(payment: any, daysLeft: number) {
    const { member, gym } = payment
    if (member.whatsapp) {
      const msg = this.whatsapp.paymentDueMessage(member.firstName, daysLeft, Number(payment.amount), gym.name)
      await this.whatsapp.send(member.whatsapp, msg)
    }
    if (member.email) {
      const html = this.email.buildPaymentDueEmail(member.firstName, daysLeft, Number(payment.amount), gym.name)
      await this.email.send(member.email, `Recordatorio de pago — ${gym.name}`, html)
    }
    await this.prisma.notification.create({
      data: {
        gymId: gym.id,
        memberId: member.id,
        type: 'PAYMENT_DUE',
        channel: 'EMAIL',
        title: 'Cuota próxima a vencer',
        body: `Tu cuota vence en ${daysLeft} días`,
        status: 'SENT',
        sentAt: new Date(),
      },
    })
  }

  private async sendOverdueNotification(payment: any) {
    const { member, gym } = payment
    if (member.whatsapp) {
      const msg = `🔴 Hola ${member.firstName}, tu cuota en *${gym.name}* está VENCIDA. Por favor, regularizá tu situación para seguir accediendo.`
      await this.whatsapp.send(member.whatsapp, msg)
    }
    await this.prisma.notification.create({
      data: {
        gymId: gym.id,
        memberId: member.id,
        type: 'PAYMENT_OVERDUE',
        channel: 'WHATSAPP',
        title: 'Cuota vencida',
        body: 'Tu cuota está vencida',
        status: 'SENT',
        sentAt: new Date(),
      },
    })
  }
}
