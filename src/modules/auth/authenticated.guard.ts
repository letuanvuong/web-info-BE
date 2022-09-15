/* eslint-disable no-console */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

/**
 * FIXME viết lại decorator cho authen
 * copy from wbn backend
 */
@Injectable()
export class AuthenGlobal implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredLogin = this.reflector.get<string[]>(
        'login',
        context.getHandler(),
      )
      if (requiredLogin) {
        return true
      }
      const Args = await context.getArgs()
      for (const Arg of Args) {
        if (
          typeof Arg === 'object' &&
          Object.keys(Arg).indexOf('currentUser') > -1
        ) {
          return Arg['currentUser'] ? true : false
        }
      }
      return false
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
