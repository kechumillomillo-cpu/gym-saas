import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

export class CreateExerciseDto {
  name: string
  description?: string
  categoryId?: string
  muscleGroups?: string[]
  equipment?: string[]
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  imageUrl?: string
  videoUrl?: string
}

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async findAll(gymId: string, search?: string, categoryId?: string) {
    return this.prisma.exercise.findMany({
      where: {
        OR: [{ isGlobal: true }, { gymId }],
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string) {
    const ex = await this.prisma.exercise.findUnique({ where: { id }, include: { category: true } })
    if (!ex) throw new NotFoundException()
    return ex
  }

  async getCategories() {
    return this.prisma.exerciseCategory.findMany({ orderBy: { name: 'asc' } })
  }

  async create(gymId: string, dto: CreateExerciseDto) {
    return this.prisma.exercise.create({ data: { gymId, ...dto } })
  }

  async update(gymId: string, id: string, dto: Partial<CreateExerciseDto>) {
    const ex = await this.prisma.exercise.findFirst({ where: { id, gymId } })
    if (!ex) throw new NotFoundException()
    return this.prisma.exercise.update({ where: { id }, data: dto })
  }

  async remove(gymId: string, id: string) {
    const ex = await this.prisma.exercise.findFirst({ where: { id, gymId, isGlobal: false } })
    if (!ex) throw new NotFoundException()
    await this.prisma.exercise.delete({ where: { id } })
  }
}
