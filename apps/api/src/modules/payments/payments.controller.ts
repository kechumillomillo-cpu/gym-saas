import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PaymentsService, CreatePaymentDto, CreateMpPreferenceDto } from './payments.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { GetGymId, Public, Roles } from '../../common/decorators'

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Public()
  @Post('webhook/mp')
  @HttpCode(200)
  webhook(@Body() body: any) {
    return this.service.handleWebhook(body)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('plans')
  getPlans(@GetGymId() gymId: string) {
    return this.service.getPlans(gymId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('plans')
  @Roles('OWNER', 'ADMIN')
  createPlan(@GetGymId() gymId: string, @Body() dto: any) {
    return this.service.createPlan(gymId, dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('revenue/month')
  monthRevenue(@GetGymId() gymId: string) {
    return this.service.getMonthRevenue(gymId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(
    @GetGymId() gymId: string,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(gymId, { memberId, status, page, limit })
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('OWNER', 'ADMIN', 'RECEPTIONIST')
  create(@GetGymId() gymId: string, @Body() dto: CreatePaymentDto) {
    return this.service.create(gymId, dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('mp-preference')
  createPreference(@GetGymId() gymId: string, @Body() dto: CreateMpPreferenceDto) {
    return this.service.createMpPreference(gymId, dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/paid')
  @Roles('OWNER', 'ADMIN', 'RECEPTIONIST')
  markPaid(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.markAsPaid(gymId, id)
  }
}
