import { IsString, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { MemberStatus } from '@gym-saas/shared'

export class CreateMemberDto {
  @ApiProperty() @IsString() firstName: string
  @ApiProperty() @IsString() lastName: string
  @ApiPropertyOptional() @IsOptional() @IsString() dni?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() birthDate?: string
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string
  @ApiPropertyOptional() @IsOptional() @IsString() whatsapp?: string
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string
  @ApiPropertyOptional() @IsOptional() @IsString() photoUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsString() emergencyContact?: string
  @ApiPropertyOptional() @IsOptional() @IsString() emergencyPhone?: string
  @ApiPropertyOptional() @IsOptional() @IsString() medicalNotes?: string
  @ApiPropertyOptional() @IsOptional() @IsString() password?: string
}

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'])
  status?: MemberStatus
}

export class MemberQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string
  @ApiPropertyOptional() @IsOptional() status?: MemberStatus
  @ApiPropertyOptional() @IsOptional() page?: number
  @ApiPropertyOptional() @IsOptional() limit?: number
}
