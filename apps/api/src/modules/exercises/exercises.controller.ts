import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ExercisesService, CreateExerciseDto } from './exercises.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { GetGymId } from '../../common/decorators'

@ApiTags('Exercises')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exercises')
export class ExercisesController {
  constructor(private service: ExercisesService) {}

  @Get('categories')
  getCategories() {
    return this.service.getCategories()
  }

  @Get()
  findAll(@GetGymId() gymId: string, @Query('search') search?: string, @Query('categoryId') categoryId?: string) {
    return this.service.findAll(gymId, search, categoryId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post()
  create(@GetGymId() gymId: string, @Body() dto: CreateExerciseDto) {
    return this.service.create(gymId, dto)
  }

  @Patch(':id')
  update(@GetGymId() gymId: string, @Param('id') id: string, @Body() dto: Partial<CreateExerciseDto>) {
    return this.service.update(gymId, id, dto)
  }

  @Delete(':id')
  remove(@GetGymId() gymId: string, @Param('id') id: string) {
    return this.service.remove(gymId, id)
  }
}
