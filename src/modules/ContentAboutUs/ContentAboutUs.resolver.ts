import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { EnumLanguage, InputContentAboutUs } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ContentAboutUsNotFoundError } from './ContentAboutUs.error'
import { ContentAboutUsService } from './ContentAboutUs.service'
import { ContentAboutUsDocument } from './schemas/ContentAboutUs.schema'
@Resolver('ContentAboutUs')
export class ContentAboutUsResolver {
  constructor(private contentAboutUsService: ContentAboutUsService) {}

  @Query()
  async getContentAboutUs(
    @Args('language') language: EnumLanguage,
  ): Promise<ContentAboutUsDocument> {
    const foundContentAboutUs =
      await this.contentAboutUsService.getContentAboutUs(language)

    if (!foundContentAboutUs) throw new ContentAboutUsNotFoundError()

    return foundContentAboutUs
  }

  @Mutation()
  async createOrUpdateContentAboutUs(
    @Args('language') language: EnumLanguage,
    @Args('input') input: InputContentAboutUs,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.contentAboutUsService.createOrUpdateContentAboutUs(
      language,
      input,
    )
  }
}
