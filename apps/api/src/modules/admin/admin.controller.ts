import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { GetGymId, Roles } from '../../common/decorators'

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('gym')
  getGym(@GetGymId() gymId: string) {
    return this.service.getGym(gymId)
  }

  @Patch('gym')
  updateGym(@GetGymId() gymId: string, @Body() dto: any) {
    return this.service.updateGymSettings(gymId, dto)
  }

  @Get('users')
  getUsers(@GetGymId() gymId: string) {
    return this.service.getUsers(gymId)
  }

  @Post('users')
  createUser(@GetGymId() gymId: string, @Body() dto: any) {
    return this.service.createUser(gymId, dto)
  }

  @Patch('users/:id/role')
  @Roles('OWNER')
  updateRole(@GetGymId() gymId: string, @Param('id') id: string, @Body('role') role: string) {
    return this.service.updateUserRole(gymId, id, role)
  }

  @Patch('users/:id/deactivate')
  deactivate(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.deactivateUser(gymId, id)
  }

  @Get('audit')
  @Roles('OWNER')
  getAudit(@GetGymId() gymId: string, @Query('page') page?: number) {
    return this.service.getAuditLogs(gymId, page)
  }

  @Get('announcements')
  getAnnouncements(@GetGymId() gymId: string) {
    return this.service.getAnnouncements(gymId)
  }

  @Post('announcements')
  createAnnouncement(@GetGymId() gymId: string, @Body() dto: any) {
    return this.service.createAnnouncement(gymId, dto)
  }
}
