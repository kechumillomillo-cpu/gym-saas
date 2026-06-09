import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'admin@fitpro.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'Admin1234!' })
  @IsString()
  @MinLength(6)
  password: string

  @ApiPropertyOptional({ example: 'demo-gym' })
  @IsOptional()
  @IsString()
  gymSlug?: string
}

export class RegisterGymDto {
  @ApiProperty({ example: 'Mi Gimnasio' })
  @IsString()
  gymName: string

  @ApiProperty({ example: 'mi-gimnasio' })
  @IsString()
  gymSlug: string

  @ApiProperty({ example: 'owner@migym.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string
}
