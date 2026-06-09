import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../../common/prisma/prisma.service'
import { LoginDto, RegisterGymDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto'
import { JwtPayload } from '@gym-saas/shared'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    let gymId: string
    let gymSlug: string

    if (dto.gymSlug) {
      const gym = await this.prisma.gym.findUnique({ where: { slug: dto.gymSlug } })
      if (!gym || !gym.isActive) throw new NotFoundException('Gimnasio no encontrado')
      gymId = gym.id
      gymSlug = gym.slug
    } else {
      // Super admin login (no gymSlug needed)
      const user = await this.prisma.user.findFirst({
        where: { email: dto.email, role: 'SUPER_ADMIN' },
        include: { gym: true },
      })
      if (!user) throw new UnauthorizedException('Credenciales inválidas')
      gymId = user.gymId
      gymSlug = user.gym.slug
    }

    const user = await this.prisma.user.findUnique({
      where: { gymId_email: { gymId, email: dto.email } },
      include: { gym: true },
    })

    if (!user || !user.isActive) throw new UnauthorizedException('Credenciales inválidas')

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordValid) throw new UnauthorizedException('Credenciales inválidas')

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

    return this.generateTokens(user.id, user.email, user.gymId, user.role as any, gymSlug)
  }

  async registerGym(dto: RegisterGymDto) {
    const existing = await this.prisma.gym.findUnique({ where: { slug: dto.gymSlug } })
    if (existing) throw new ConflictException('El slug ya está en uso')

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const gym = await this.prisma.gym.create({
      data: {
        slug: dto.gymSlug,
        name: dto.gymName,
        email: dto.email,
        plan: 'STARTER',
      },
    })

    const user = await this.prisma.user.create({
      data: {
        gymId: gym.id,
        email: dto.email,
        passwordHash,
        role: 'OWNER',
      },
    })

    return this.generateTokens(user.id, user.email, gym.id, 'OWNER', gym.slug)
  }

  async refresh(dto: RefreshTokenDto) {
    const token = await this.prisma.refreshToken.findUnique({ where: { token: dto.refreshToken } })
    if (!token || token.expiresAt < new Date()) {
      if (token) await this.prisma.refreshToken.delete({ where: { id: token.id } })
      throw new UnauthorizedException('Refresh token inválido o expirado')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: token.userId },
      include: { gym: true },
    })
    if (!user || !user.isActive) throw new UnauthorizedException()

    await this.prisma.refreshToken.delete({ where: { id: token.id } })
    return this.generateTokens(user.id, user.email, user.gymId, user.role as any, user.gym.slug)
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } })
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException()

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Contraseña actual incorrecta')

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        gymId: true,
        isActive: true,
        lastLoginAt: true,
        gym: { select: { name: true, slug: true, logoUrl: true, plan: true, settings: true } },
        member: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      },
    })
  }

  private async generateTokens(
    userId: string,
    email: string,
    gymId: string,
    role: JwtPayload['role'],
    gymSlug: string,
  ) {
    const payload: JwtPayload = { sub: userId, email, gymId, role, gymSlug }

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m',
    })

    const rawRefresh = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.prisma.refreshToken.create({
      data: { userId, token: rawRefresh, expiresAt },
    })

    return { accessToken, refreshToken: rawRefresh, user: { id: userId, email, gymId, role, gymSlug } }
  }
}
