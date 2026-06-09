import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, logoUrl: true, coverUrl: true, plan: true, isActive: true },
    })
    if (!gym || !gym.isActive) throw new NotFoundException('Gimnasio no encontrado')
    return gym
  }

  async findAll() {
    return this.prisma.gym.findMany({ select: { id: true, slug: true, name: true, plan: true, isActive: true } })
  }
}
