import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole, ROLES_HIERARCHY } from '@gym-saas/shared'
import { ROLES_KEY } from '../decorators'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles || requiredRoles.length === 0) return true

    const { user } = context.switchToHttp().getRequest()
    const userLevel = ROLES_HIERARCHY[user?.role] ?? 0
    const minRequired = Math.min(...requiredRoles.map((r) => ROLES_HIERARCHY[r] ?? 0))

    if (userLevel < minRequired) {
      throw new ForbiddenException('No tenés permisos para realizar esta acción')
    }
    return true
  }
}
