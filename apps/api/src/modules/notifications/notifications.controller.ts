import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { GetUser, GetGymId, Roles } from '../../common/decorators'
import { RolesGuard } from '../../common/guards/roles.guard'

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  findAll(@GetGymId() gymId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll(gymId, page, limit)
  }

  @Post('custom')
  @Roles('OWNER', 'ADMIN')
  sendCustom(@GetGymId() gymId: string, @Body() dto: { memberId?: string; title: string; body: string; channels: string[] }) {
    return this.service.sendCustom(gymId, dto)
  }

  @Post('fcm-token')
  saveFcmToken(@GetUser('sub') userId: string, @Body('token') token: string) {
    return this.service.saveFcmToken(userId, token)
  }
}
