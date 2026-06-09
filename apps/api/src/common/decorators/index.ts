import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'
import { UserRole } from '@gym-saas/shared'

export const GetUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user
  return data ? user?.[data] : user
})

export const GetGymId = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user?.gymId
})

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)

export const Public = () => SetMetadata('isPublic', true)
