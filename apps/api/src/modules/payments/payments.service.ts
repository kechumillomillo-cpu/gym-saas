import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../common/prisma/prisma.service'

export class CreatePaymentDto {
  memberId: string
  planId?: string
  amount: number
  method?: 'CASH' | 'CARD' | 'TRANSFER' | 'MERCADO_PAGO' | 'OTHER'
  notes?: string
  dueDate?: string
  periodStart?: string
  periodEnd?: string
}

export class CreateMpPreferenceDto {
  memberId: string
  planId?: string
  amount: number
  description?: string
  backUrl?: string
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async create(gymId: string, dto: CreatePaymentDto) {
    const member = await this.prisma.member.findFirst({ where: { id: dto.memberId, gymId } })
    if (!member) throw new NotFoundException('Alumno no encontrado')

    const payment = await this.prisma.payment.create({
      data: {
        gymId,
        memberId: dto.memberId,
        planId: dto.planId,
        amount: dto.amount,
        method: dto.method || 'CASH',
        status: dto.method === 'CASH' ? 'PAID' : 'PENDING',
        paidAt: dto.method === 'CASH' ? new Date() : undefined,
        notes: dto.notes,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        periodStart: dto.periodStart ? new Date(dto.periodStart) : undefined,
        periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : undefined,
      },
      include: { member: true, plan: true },
    })

    return payment
  }

  async createMpPreference(gymId: string, dto: CreateMpPreferenceDto) {
    const accessToken = this.config.get('MP_ACCESS_TOKEN')
    if (!accessToken) throw new BadRequestException('Mercado Pago no configurado')

    const member = await this.prisma.member.findFirst({ where: { id: dto.memberId, gymId } })
    if (!member) throw new NotFoundException()

    const gym = await this.prisma.gym.findUnique({ where: { id: gymId } })
    const token = gym?.mpAccessToken || accessToken

    const body = {
      items: [
        {
          id: `payment-${gymId}-${dto.memberId}`,
          title: dto.description || 'Cuota Gym',
          quantity: 1,
          unit_price: dto.amount,
          currency_id: 'ARS',
        },
      ],
      payer: {
        name: member.firstName,
        surname: member.lastName,
        email: member.email || 'payer@email.com',
      },
      back_urls: {
        success: `${dto.backUrl || this.config.get('FRONTEND_URL')}/payments/success`,
        failure: `${dto.backUrl || this.config.get('FRONTEND_URL')}/payments/failure`,
        pending: `${dto.backUrl || this.config.get('FRONTEND_URL')}/payments/pending`,
      },
      auto_return: 'approved',
      notification_url: `${this.config.get('FRONTEND_URL')?.replace('3000', '4000')}/api/v1/payments/webhook/mp`,
      metadata: { gymId, memberId: dto.memberId, planId: dto.planId },
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new BadRequestException('Error al crear preferencia en Mercado Pago')

    const preference = (await response.json()) as { id: string; init_point: string; sandbox_init_point: string }

    const payment = await this.prisma.payment.create({
      data: {
        gymId,
        memberId: dto.memberId,
        planId: dto.planId,
        amount: dto.amount,
        method: 'MERCADO_PAGO',
        status: 'PENDING',
        mpPreferenceId: preference.id,
      },
    })

    return {
      paymentId: payment.id,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    }
  }

  async handleWebhook(payload: any) {
    if (payload.type !== 'payment') return { received: true }

    const mpPaymentId = payload.data?.id?.toString()
    if (!mpPaymentId) return { received: true }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
      headers: { Authorization: `Bearer ${this.config.get('MP_ACCESS_TOKEN')}` },
    })
    const mpPayment = (await response.json()) as any

    if (mpPayment.status === 'approved') {
      const prefId = mpPayment.preference_id
      const payment = await this.prisma.payment.findFirst({ where: { mpPreferenceId: prefId } })
      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', mpPaymentId, mpStatus: 'approved', paidAt: new Date() },
        })
      }
    }

    return { received: true }
  }

  async findAll(gymId: string, params: { memberId?: string; status?: string; page?: number; limit?: number }) {
    const { memberId, status, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit
    const where: any = { gymId }
    if (memberId) where.memberId = memberId
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { member: { select: { firstName: true, lastName: true, email: true } }, plan: true },
      }),
      this.prisma.payment.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async markAsPaid(gymId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id, gymId } })
    if (!payment) throw new NotFoundException()
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    })
  }

  async getPlans(gymId: string) {
    return this.prisma.paymentPlan.findMany({ where: { gymId, isActive: true }, orderBy: { amount: 'asc' } })
  }

  async createPlan(gymId: string, dto: { name: string; amount: number; durationDays: number; description?: string }) {
    return this.prisma.paymentPlan.create({ data: { gymId, ...dto } })
  }

  async getMonthRevenue(gymId: string) {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    const result = await this.prisma.payment.aggregate({
      where: { gymId, status: 'PAID', paidAt: { gte: start } },
      _sum: { amount: true },
    })
    return { total: Number(result._sum.amount || 0), month: start }
  }
}
