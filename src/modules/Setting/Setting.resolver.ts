import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Setting as SettingGql } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { SettingService } from './Setting.service'
@Resolver()
export class SettingResolver {
  constructor(private settingService: SettingService) {}

  @Query()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSetting(@Context() context: IContext) {
    // const currentUserId = await context?.authManager.getCurrentUserId()
    // if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.settingService.getSetting()
  }

  @Mutation()
  async updateSettingType(
    @Args() args,
    @Context() context: IContext,
  ): Promise<SettingGql> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.settingService.updateSettingType(args)
  }
}
