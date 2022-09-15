import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { UnauthorizedError } from './auth.error'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    )
    if (!requiredPermissions) {
      return true
    }
    const ctx = context.getArgByIndex(2)
    const userPermissions = ctx.permissions
    if (!userPermissions || !Array.isArray(userPermissions)) return false
    const hasEnoughPermissions = () =>
      requiredPermissions.every((requiredPerm) =>
        userPermissions.includes(requiredPerm),
      )
    if (!hasEnoughPermissions())
      throw new UnauthorizedError('Insufficient permission')
    return hasEnoughPermissions()
  }
}
