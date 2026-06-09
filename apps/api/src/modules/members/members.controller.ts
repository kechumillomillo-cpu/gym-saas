import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { MembersService } from './members.service'
import { CreateMemberDto, UpdateMemberDto, MemberQueryDto } from './dto/member.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { GetGymId, Roles } from '../../common/decorators'

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private service: MembersService) {}

  @Post()
  @Roles('OWNER', 'ADMIN', 'RECEPTIONIST')
  create(@GetGymId() gymId: string, @Body() dto: CreateMemberDto) {
    return this.service.create(gymId, dto)
  }

  @Get()
  findAll(@GetGymId() gymId: string, @Query() query: MemberQueryDto) {
    return this.service.findAll(gymId, query)
  }

  @Get(':id')
  findOne(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.findOne(gymId, id)
  }

  @Get(':id/qr')
  generateQr(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.generateQr(gymId, id)
  }

  @Get(':id/history')
  getHistory(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.getHistory(gymId, id)
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'TRAINER', 'RECEPTIONIST')
  update(@GetGymId() gymId: string, @Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.service.update(gymId, id, dto)
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  remove(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.remove(gymId, id)
  }
}
