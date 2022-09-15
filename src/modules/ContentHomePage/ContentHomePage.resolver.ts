import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-express'
import {
  EnumEcomStockModelTag,
  EnumLanguage,
  InputContentHomePage,
} from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ServiceManager } from '../base-modules/service-manager/service-manager'
import { StockModelDocument } from '../StockModel/schemas/StockModel.schema'
import {
  IsLatestProductError,
  StockModelNotFoundError,
} from '../StockModel/StockModel.error'
import { StockModelService } from '../StockModel/StockModel.service'
import { ContentHomePageNotFoundError } from './ContentHomePage.error'
import { ContentHomePageService } from './ContentHomePage.service'
import { ContentHomePageDocument } from './schemas/ContentHomePage.schema'
@Resolver('ContentHomePage')
export class ContentHomePageResolver {
  constructor(
    private contentHomePageService: ContentHomePageService,
    private readonly serviceManager: ServiceManager,
  ) {}

  @Query()
  async getContentHomePage(
    @Args('language') language: EnumLanguage,
  ): Promise<ContentHomePageDocument> {
    const foundContentHomePage =
      await this.contentHomePageService.findContentHomePage(language)

    if (!foundContentHomePage) throw new ContentHomePageNotFoundError()

    return foundContentHomePage
  }

  @Mutation()
  async createLatestProductById(
    @Args('idStockModel') idStockModel: string,
    @Context() context: IContext,
  ): Promise<StockModelDocument> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const foundProduct = await this.serviceManager
      .get(StockModelService)
      .findStockModelMatchAny([{ _id: idStockModel }])

    if (!foundProduct) throw new StockModelNotFoundError()

    if (foundProduct?.ecomTags.includes(EnumEcomStockModelTag.New))
      throw new IsLatestProductError()

    const result = await this.serviceManager
      .get(StockModelService)
      .createLatestProductById(idStockModel)

    return result
  }

  @Mutation()
  async deleteLatestProductById(
    @Args('idStockModel') idStockModel: string,
    @Context() context: IContext,
  ): Promise<StockModelDocument> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const foundProduct = await this.serviceManager
      .get(StockModelService)
      .findStockModelMatchAny([{ _id: idStockModel }])

    if (!foundProduct) throw new StockModelNotFoundError()

    const result = await this.serviceManager
      .get(StockModelService)
      .deleteLatestProductById(idStockModel)

    return result
  }

  @Mutation()
  async createOrUpdateContentHomePage(
    @Args('input') input: InputContentHomePage,
    @Context() context: IContext,
  ): Promise<ContentHomePageDocument | ApolloError> {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const { language } = input
    const foundContentHomePage =
      await this.contentHomePageService.findContentHomePageMatchAny([
        { language },
      ])

    /** nếu tìm thấy content thì update */
    if (foundContentHomePage) {
      const updatedContentHomePage =
        await this.contentHomePageService.updateContentHomePage(
          foundContentHomePage._id,
          input,
        )
      return updatedContentHomePage
    }

    /** default tạo mới content */
    const createdContentHomePage =
      await this.contentHomePageService.createContentHomePage(input)

    return createdContentHomePage
  }
}
