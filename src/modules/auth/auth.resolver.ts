import { Args, Context, Query, Resolver } from '@nestjs/graphql'
// import { LoginDTO } from './dto/login-user.dto'
import { AuthenticationInfo, LoginInput } from 'src/schema'

import { IContext } from '../base-modules/graphql/gql.type'
import { AuthService } from './auth.service'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query()
  async login(
    @Args('info') info: LoginInput,
    @Context() context: IContext,
  ): Promise<AuthenticationInfo> {
    const { Username, Email, Password } = info

    return this.authService.login({
      Username,
      Email,
      Password,
      request: context.req,
      response: context.res,
    })
  }

  @Query()
  async logout(): Promise<boolean> {
    return this.authService.logout()
  }

  @Query()
  async loginAdmin(
    @Args('info') info: LoginInput,
    @Context() context: IContext,
  ): Promise<AuthenticationInfo> {
    const { Username, Email, Password } = info

    return this.authService.loginAdmin({
      Username,
      Email,
      Password,
      request: context.req,
      response: context.res,
    })
  }

  @Query()
  async logoutAdmin(): Promise<boolean> {
    return this.authService.logoutAdmin()
  }
}
