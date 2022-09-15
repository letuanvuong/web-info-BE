import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { VerifyTokenService } from './VerifyToken.service'
@Resolver('VerifyToken')
export class VerifyTokenResolver {
  constructor(private verifyTokenService: VerifyTokenService) {}

  @Mutation()
  async sendVerifyMail(@Args('email') email: string) {
    return this.verifyTokenService.sendVerifyMail(email)
  }

  @Mutation()
  async verifyAccount(@Args('token') token: string) {
    return this.verifyTokenService.verifyAccount(token)
  }
}
