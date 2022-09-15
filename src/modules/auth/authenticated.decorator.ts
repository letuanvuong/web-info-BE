import { SetMetadata } from '@nestjs/common'

/**
 * copy from wbn backend
 */
export const Authenticated = (requestLogin?: boolean) =>
  SetMetadata('login', requestLogin)
