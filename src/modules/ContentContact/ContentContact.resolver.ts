import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-express'
import { EnumLanguage, InputContentContact } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ContentContactNotFoundError } from './ContentContact.error'
import { ContentContactService } from './ContentContact.service'
import { ContentContactDocument } from './schemas/ContentContact.schema'

@Resolver('ContentContact')
export class ContentContactResolver {
  constructor(private contentContactService: ContentContactService) {}

  @Query()
  async getContentContact(
    @Args('language') language: EnumLanguage,
  ): Promise<ContentContactDocument | ApolloError> {
    const foundContentContact =
      await this.contentContactService.findContentContact(language)

    if (!foundContentContact) throw new ContentContactNotFoundError()

    return foundContentContact
  }

  @Mutation()
  async createOrUpdateContentContact(
    @Args('input') input: InputContentContact,
    @Context() context: IContext,
  ): Promise<ContentContactDocument | ApolloError> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const { language } = input
    const foundContentContact =
      await this.contentContactService.findContentContactMatchAny([
        { language },
      ])

    /** nếu tìm thấy content thì update */
    if (foundContentContact) {
      const updatedContentContact =
        await this.contentContactService.updateContentContact(
          foundContentContact._id,
          input,
        )
      return updatedContentContact
    }

    /** default tạo mới content */
    const createdContentContact =
      await this.contentContactService.createContentContact(input)

    return createdContentContact
  }
}
