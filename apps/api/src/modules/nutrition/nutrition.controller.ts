import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { NutritionService, CreateBodyMetricDto } from './nutrition.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { GetGymId } from '../../common/decorators'

@ApiTags('Nutrition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private service: NutritionService) {}

  @Post('metrics')
  createMetric(@GetGymId() gymId: string, @Body() dto: CreateBodyMetricDto) {
    return this.service.createMetric(gymId, dto)
  }

  @Get('metrics/:memberId')
  getMetrics(@GetGymId() gymId: string, @Param('memberId') memberId: string) {
    return this.service.getMetrics(gymId, memberId)
  }

  @Get('metrics/:memberId/latest')
  getLatest(@GetGymId() gymId: string, @Param('memberId') memberId: string) {
    return this.service.getLatestMetric(gymId, memberId)
  }

  @Post('photos')
  addPhoto(@GetGymId() gymId: string, @Body() dto: { memberId: string; url: string; angle: string; notes?: string }) {
    return this.service.addProgressPhoto(gymId, dto.memberId, dto.url, dto.angle, dto.notes)
  }

  @Get('photos/:memberId')
  getPhotos(@GetGymId() gymId: string, @Param('memberId') memberId: string) {
    return this.service.getProgressPhotos(gymId, memberId)
  }
}
