import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { EnumLanguage, InputContentSecurity } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ContentSecurityNotFoundError } from './ContentSecurity.error'
import { ContentSecurityService } from './ContentSecurity.service'
import { ContentSecurityDocument } from './schemas/ContentSecurity.schema'
@Resolver('ContentSecurity')
export class ContentSecurityResolver {
  constructor(private contentSecurityService: ContentSecurityService) {}

  @Query()
  async getContentSecurity(
    @Args('language') language: EnumLanguage,
  ): Promise<ContentSecurityDocument> {
    const foundContentSecurity =
      await this.contentSecurityService.getContentSecurity(language)

    if (!foundContentSecurity) throw new ContentSecurityNotFoundError()

    return foundContentSecurity
  }

  @Mutation()
  async createOrUpdateContentSecurity(
    @Args('language') language: EnumLanguage,
    @Args('input') input: InputContentSecurity,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return this.contentSecurityService.createOrUpdateContentSecurity(
      language,
      input,
    )
  }
}
