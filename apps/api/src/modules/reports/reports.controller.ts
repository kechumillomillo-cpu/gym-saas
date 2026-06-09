import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { GetGymId, Roles } from '../../common/decorators'

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'ADMIN')
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('billing')
  billing(@GetGymId() gymId: string, @Query('year') year: number, @Query('month') month: number) {
    return this.service.getBilling(gymId, year || new Date().getFullYear(), month || new Date().getMonth() + 1)
  }

  @Get('retention')
  retention(@GetGymId() gymId: string) {
    return this.service.getMemberRetention(gymId)
  }

  @Get('members')
  members(@GetGymId() gymId: string) {
    return this.service.getActiveVsInactive(gymId)
  }

  @Get('attendance')
  attendance(@GetGymId() gymId: string, @Query('days') days?: number) {
    return this.service.getAttendanceReport(gymId, days)
  }
}
