import { IsString, IsOptional, IsInt, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class RoutineExerciseDto {
  @ApiProperty() @IsString() exerciseId: string
  @ApiProperty() @IsInt() @Min(1) @Max(7) dayOfWeek: number
  @ApiPropertyOptional() @IsOptional() @IsInt() order?: number
  @ApiPropertyOptional() @IsOptional() @IsInt() sets?: number
  @ApiPropertyOptional() @IsOptional() @IsString() reps?: string
  @ApiPropertyOptional() @IsOptional() @IsString() weight?: string
  @ApiPropertyOptional() @IsOptional() @IsInt() restSecs?: number
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string
}

export class CreateRoutineDto {
  @ApiProperty() @IsString() name: string
  @ApiPropertyOptional() @IsOptional() @IsString() goal?: string
  @ApiPropertyOptional() @IsOptional() @IsInt() durationWeeks?: number
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isTemplate?: boolean
  @ApiPropertyOptional({ type: [RoutineExerciseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  exercises?: RoutineExerciseDto[]
}

export class UpdateRoutineDto extends PartialType(CreateRoutineDto) {}

export class AssignRoutineDto {
  @ApiProperty() @IsString() memberId: string
  @ApiProperty() @IsString() routineId: string
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string
  @ApiPropertyOptional() @IsOptional() @IsString() trainerId?: string
}
