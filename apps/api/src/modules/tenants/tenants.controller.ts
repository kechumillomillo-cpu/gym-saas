import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { TenantsService } from './tenants.service'
import { Public } from '../../common/decorators'

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private service: TenantsService) {}

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug)
  }
}
