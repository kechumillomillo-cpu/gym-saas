import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { RoutinesService } from './routines.service'
import { CreateRoutineDto, UpdateRoutineDto, AssignRoutineDto } from './dto/routine.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { GetGymId, Roles } from '../../common/decorators'

@ApiTags('Routines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private service: RoutinesService) {}

  @Post()
  @Roles('OWNER', 'ADMIN', 'TRAINER')
  create(@GetGymId() gymId: string, @Body() dto: CreateRoutineDto) {
    return this.service.create(gymId, dto)
  }

  @Get()
  findAll(@GetGymId() gymId: string) {
    return this.service.findAll(gymId)
  }

  @Get('expiring')
  @Roles('OWNER', 'ADMIN', 'TRAINER')
  getExpiring(@GetGymId() gymId: string, @Query('days') days?: number) {
    return this.service.getExpiringSoon(gymId, days)
  }

  @Get(':id')
  findOne(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.findOne(gymId, id)
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'TRAINER')
  update(@GetGymId() gymId: string, @Param('id') id: string, @Body() dto: UpdateRoutineDto) {
    return this.service.update(gymId, id, dto)
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  remove(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.remove(gymId, id)
  }

  @Post('assign')
  @Roles('OWNER', 'ADMIN', 'TRAINER')
  assign(@GetGymId() gymId: string, @Body() dto: AssignRoutineDto) {
    return this.service.assign(gymId, dto)
  }

  @Get('member/:memberId')
  getMemberRoutine(@Param('memberId') memberId: string) {
    return this.service.getMemberRoutine(memberId)
  }
}
