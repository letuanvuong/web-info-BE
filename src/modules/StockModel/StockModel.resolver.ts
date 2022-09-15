import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { LeanDocument } from 'mongoose'
import { hasOwnProperty } from 'src/helper'
import {
  FilterStockModelInput,
  InputOptionsQueryStockModel,
  SearchStockModelInput,
  SortStockModelInput,
  StockModelInput,
} from 'src/schema'

import { IContext } from '../base-modules/graphql/gql.type'
import { StockModelDocument } from './schemas/StockModel.schema'
import { StockModelService } from './StockModel.service'

@Resolver('StockModel')
export class StockModelResolver {
  constructor(private stockModelService: StockModelService) {}

  @Query()
  async getStockModelById(@Args('_id') _id: string) {
    return await this.stockModelService.getStockModelById(_id)
  }

  @Query()
  async getStockModels() {
    const result = await this.stockModelService.getStockModels()
    return result
  }

  @Query()
  async getRandomStockModels(@Args('limit') limit: number) {
    const result = await this.stockModelService.getRandomStockModels(limit)
    return result
  }

  @Query()
  async getStockModelBySlugEcomCategoryPagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchStockModelInput],
    @Args('filter') filter: [FilterStockModelInput],
    @Args('sort') sort: [SortStockModelInput],
  ) {
    return await this.stockModelService.getStockModelBySlugEcomCategoryPagination(
      page,
      limit,
      search,
      filter,
      sort,
    )
  }

  @Query()
  async getStockModelBySlugEcomCategoryPaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchStockModelInput],
    @Args('filter') filter: [FilterStockModelInput],
  ) {
    return await this.stockModelService.getStockModelBySlugEcomCategoryPaginationTotal(
      page,
      limit,
      search,
      filter,
    )
  }

  @Query()
  async getStockModelBySlugProduct(@Args('slug') slug: string) {
    return await this.stockModelService.getStockModelBySlugProduct(slug)
  }

  @Query()
  async getRelatedProducts(
    @Args('ecomSlug') ecomSlug: string,
    @Args('productSlug') productSlug: string,
  ) {
    return await this.stockModelService.getRelatedProducts(
      ecomSlug,
      productSlug,
    )
  }

  @Query()
  stockModels(
    @Args('filterOptions') filterOptions: InputOptionsQueryStockModel,
  ) {
    return this.stockModelService.stockModels(filterOptions)
  }

  /** Resolver Fields */
  @ResolveField('ecomCategory')
  async fieldCustomer(
    @Parent()
    stockModel: LeanDocument<StockModelDocument>,
    @Context() context: IContext,
  ) {
    if (hasOwnProperty(stockModel, 'ecomCategory'))
      return stockModel['ecomCategory']

    const result = await context.loaderManager
      .getLoader('EcomCategoryLoader')
      .load(stockModel.idEcomCategory)

    return result
  }

  @Query()
  async getStockModelPagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchStockModelInput],
    @Args('filter') filter: [FilterStockModelInput],
    @Args('sort') sort: [SortStockModelInput],
    @Args('idsDefault') idsDefault?: [string],
  ) {
    return await this.stockModelService.getStockModelPagination(
      page,
      limit,
      search,
      filter,
      sort,
      idsDefault,
    )
  }

  @Query()
  async getStockModelPaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchStockModelInput],
    @Args('filter') filter: [FilterStockModelInput],
  ) {
    return await this.stockModelService.getStockModelPaginationTotal(
      page,
      limit,
      search,
      filter,
    )
  }

  @Mutation()
  async createStockModel(
    @Args('input') input: StockModelInput,
    @Args('idsStockModelRelated') idsStockModelRelated: string[],
  ): Promise<StockModelDocument> {
    return await this.stockModelService.createStockModel(
      input,
      idsStockModelRelated,
    )
  }

  @Mutation()
  async updateStockModel(
    @Args('_id') _id: string,
    @Args('input') input: StockModelInput,
    @Args('idsStockModelRelated') idsStockModelRelated: string[],
  ): Promise<StockModelDocument> {
    return await this.stockModelService.updateStockModel(
      _id,
      input,
      idsStockModelRelated,
    )
  }

  @Mutation()
  async deleteStockModel(
    @Args('_id') _id: string,
  ): Promise<StockModelDocument> {
    return await this.stockModelService.deleteStockModel(_id)
  }

  @Mutation()
  async importFileStockModel(
    @Args('input') input: [StockModelInput],
  ): Promise<boolean> {
    return await this.stockModelService.importFileStockModel(input)
  }
}
