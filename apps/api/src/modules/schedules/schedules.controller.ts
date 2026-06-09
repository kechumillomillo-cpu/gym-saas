import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SchedulesService } from './schedules.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { GetGymId, GetUser, Roles } from '../../common/decorators'

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private service: SchedulesService) {}

  @Get('slots')
  getSlots(@GetGymId() gymId: string) {
    return this.service.getSlots(gymId)
  }

  @Post('slots')
  @Roles('OWNER', 'ADMIN')
  createSlot(@GetGymId() gymId: string, @Body() dto: any) {
    return this.service.createSlot(gymId, dto)
  }

  @Patch('slots/:id')
  @Roles('OWNER', 'ADMIN')
  updateSlot(@GetGymId() gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateSlot(gymId, id, dto)
  }

  @Delete('slots/:id')
  @Roles('OWNER', 'ADMIN')
  deleteSlot(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.deleteSlot(gymId, id)
  }

  @Get('reservations')
  getReservations(@GetGymId() gymId: string, @Query('date') date?: string) {
    return this.service.getReservations(gymId, date)
  }

  @Post('reserve')
  reserve(@GetGymId() gymId: string, @GetUser() user: any, @Body() dto: { slotId: string; date: string; memberId?: string }) {
    const memberId = dto.memberId || user.memberId
    return this.service.reserve(gymId, memberId, dto.slotId, dto.date)
  }

  @Patch('reservations/:id/cancel')
  cancel(@GetUser('sub') userId: string, @Param('id') id: string) {
    return this.service.cancelReservation(userId, id)
  }

  @Get('holidays')
  getHolidays(@GetGymId() gymId: string) {
    return this.service.getHolidays(gymId)
  }

  @Post('holidays')
  @Roles('OWNER', 'ADMIN')
  addHoliday(@GetGymId() gymId: string, @Body() dto: { date: string; reason?: string }) {
    return this.service.addHoliday(gymId, dto)
  }

  @Delete('holidays/:id')
  @Roles('OWNER', 'ADMIN')
  removeHoliday(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.removeHoliday(gymId, id)
  }

  @Get('occupancy')
  @Roles('OWNER', 'ADMIN', 'TRAINER')
  getOccupancy(@GetGymId() gymId: string, @Query('weekStart') weekStart: string) {
    return this.service.getOccupancy(gymId, weekStart)
  }
}
