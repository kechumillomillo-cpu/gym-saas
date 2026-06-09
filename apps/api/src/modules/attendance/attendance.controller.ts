import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AttendanceService } from './attendance.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { GetGymId, Public } from '../../common/decorators'

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Public()
  @Post('qr-checkin')
  checkInByQr(@Body() payload: { gymId: string; memberId: string }) {
    return this.service.checkInByQr(payload)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkin')
  checkIn(@GetGymId() gymId: string, @Body() dto: { memberId: string }) {
    return this.service.checkIn(gymId, dto.memberId, 'MANUAL')
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/checkout')
  checkOut(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.checkOut(gymId, id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @GetGymId() gymId: string,
    @Query('date') date?: string,
    @Query('memberId') memberId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(gymId, { date, memberId, page, limit })
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('today')
  todayCount(@GetGymId() gymId: string) {
    return this.service.getTodayCount(gymId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats(@GetGymId() gymId: string, @Query('days') days?: number) {
    return this.service.getStats(gymId, days)
  }
}
