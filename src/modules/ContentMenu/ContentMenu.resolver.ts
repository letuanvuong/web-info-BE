import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-express'
import { EnumLanguage, InputContentMenu } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ContentMenuNotFoundError } from './ContentMenu.error'
import { ContentMenuService } from './ContentMenu.service'
import { ContentMenuDocument } from './schemas/ContentMenu.schema'
@Resolver('ContentMenu')
export class ContentMenuResolver {
  constructor(private contentMenuService: ContentMenuService) {}

  @Query()
  async getContentMenu(
    @Args('language') language: EnumLanguage,
  ): Promise<ContentMenuDocument> {
    const foundContentMenu = await this.contentMenuService.findContentMenu(
      language,
    )

    if (!foundContentMenu) throw new ContentMenuNotFoundError()

    return foundContentMenu
  }

  @Mutation()
  async createOrUpdateContentMenu(
    @Args('input') input: InputContentMenu,
    @Context() context: IContext,
  ): Promise<ContentMenuDocument | ApolloError> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const { language } = input
    const foundContentMenu =
      await this.contentMenuService.findContentMenuMatchAny([{ language }])

    /** nếu tìm thấy content thì update */
    if (foundContentMenu) {
      const updatedContentMenu =
        await this.contentMenuService.updateContentMenu(
          foundContentMenu._id,
          input,
        )
      return updatedContentMenu
    }

    /** default tạo mới content */
    const createdContentMenu = await this.contentMenuService.createContentMenu(
      input,
    )

    return createdContentMenu
  }
}
