import { SetMetadata } from '@nestjs/common'

export const RequirePermissions = (...perms: string[]) =>
  SetMetadata('permissions', perms)
