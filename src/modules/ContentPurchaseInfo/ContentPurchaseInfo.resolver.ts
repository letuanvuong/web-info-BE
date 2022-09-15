import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { EnumLanguage, InputContentPurchaseInfo } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ContentPurchaseInfoNotFoundError } from './ContentPurchaseInfo.error'
import { ContentPurchaseInfoService } from './ContentPurchaseInfo.service'
import { ContentPurchaseInfoDocument } from './schemas/ContentPurchaseInfo.schema'
@Resolver('ContentPurchaseInfo')
export class ContentPurchaseInfoResolver {
  constructor(private contentPurchaseInfoService: ContentPurchaseInfoService) {}

  @Query()
  async getContentPurchaseInfo(
    @Args('language') language: EnumLanguage,
  ): Promise<ContentPurchaseInfoDocument> {
    const foundContentPurchaseInfo =
      await this.contentPurchaseInfoService.getContentPurchaseInfo(language)

    if (!foundContentPurchaseInfo) throw new ContentPurchaseInfoNotFoundError()

    return foundContentPurchaseInfo
  }

  @Mutation()
  async createOrUpdateContentPurchaseInfo(
    @Args('language') language: EnumLanguage,
    @Args('input') input: InputContentPurchaseInfo,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.contentPurchaseInfoService.createOrUpdateContentPurchaseInfo(
      language,
      input,
    )
  }
}
