import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { GetGymId } from '../../common/decorators'

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('stats')
  getStats(@GetGymId() gymId: string) {
    return this.service.getStats(gymId)
  }

  @Get('activity')
  getActivity(@GetGymId() gymId: string) {
    return this.service.getRecentActivity(gymId)
  }

  @Get('expiries')
  getExpiries(@GetGymId() gymId: string) {
    return this.service.getUpcomingExpiries(gymId)
  }

  @Get('revenue-chart')
  getRevenueChart(@GetGymId() gymId: string, @Query('months') months?: number) {
    return this.service.getRevenueChart(gymId, months)
  }
}
