import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-express'
import { EnumLanguage, InputContentFooter } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ContentFooterNotFoundError } from './ContentFooter.error'
import { ContentFooterService } from './ContentFooter.service'
import { ContentFooterDocument } from './schemas/ContentFooter.schema'

@Resolver('ContentFooter')
export class ContentFooterResolver {
  constructor(private contentFooterService: ContentFooterService) {}

  @Query()
  async getContentFooter(
    @Args('language') language: EnumLanguage,
  ): Promise<ContentFooterDocument> {
    const foundContentFooter =
      await this.contentFooterService.findContentFooter(language)

    if (!foundContentFooter) throw new ContentFooterNotFoundError()

    return foundContentFooter
  }

  @Mutation()
  async createOrUpdateContentFooter(
    @Args('input') input: InputContentFooter,
    @Context() context: IContext,
  ): Promise<ContentFooterDocument | ApolloError> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const { language } = input
    const foundContentFooter =
      await this.contentFooterService.findContentFooterMatchAny([{ language }])

    /** nếu tìm thấy content thì update */
    if (foundContentFooter) {
      const updatedContentFooter =
        await this.contentFooterService.updateContentFooter(
          foundContentFooter._id,
          input,
        )
      return updatedContentFooter
    }

    /** default tạo mới content */
    const createdContentFooter =
      await this.contentFooterService.createContentFooter(input)

    return createdContentFooter
  }
}
