import { Controller, Post, Get, Body, UseGuards, HttpCode, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto, RegisterGymDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Public, GetUser } from '../../common/decorators'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto)
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterGymDto) {
    return this.auth.registerGym(dto)
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(204)
  logout(@GetUser('sub') userId: string, @Body() body: { refreshToken?: string }) {
    return this.auth.logout(userId, body.refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  me(@GetUser('sub') userId: string) {
    return this.auth.me(userId)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('change-password')
  changePassword(@GetUser('sub') userId: string, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(userId, dto)
  }
}
