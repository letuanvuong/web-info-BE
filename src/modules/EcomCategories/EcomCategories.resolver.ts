/* eslint-disable no-console */
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-express'
import { hasOwnProperty } from 'src/helper'
import {
  EcomCategories,
  EcomCategoriesFilter,
  EcomCategoriesInput,
  EcomCategoriesSearch,
  EcomCategoriesSort,
  EnumCategoriesStatus,
} from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { EcomCategoriesService } from './EcomCategories.service'

@Resolver('EcomCategories')
export class EcomCategoriesResolver {
  constructor(private ecomCategoriesService: EcomCategoriesService) {}

  @Query()
  async getEcomCategoriesPagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('searchInput') searchInput: [EcomCategoriesSearch],
    @Args('filterInput') filterInput: [EcomCategoriesFilter],
    @Args('sortInput') sortInput: [EcomCategoriesSort],
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.getEcomCategoriesPagination(
      page,
      limit,
      searchInput,
      filterInput,
      sortInput,
    )
  }

  @Query()
  async getEcomCategoriesHasParent(
    @Args('Status') Status: EnumCategoriesStatus,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.getEcomCategoriesHasParent(Status)
  }

  @Query()
  async getEcomCategoriesPaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('searchInput') searchInput: [EcomCategoriesSearch],
    @Args('filterInput') filterInput: [EcomCategoriesFilter],
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.getEcomCategoriesPaginationTotal(
      page,
      limit,
      searchInput,
      filterInput,
    )
  }

  @Query()
  async getEcomCategoriesById(
    @Args('id') id: string,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.getEcomCategoriesById(id)
  }

  @Query()
  async getEcomCategoriesBySlug(
    @Args('slug') slug: string,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.getEcomCategoriesBySlug(slug)
  }

  @Query()
  async searchEcomCategoriesChild(
    @Args() args,
  ): Promise<EcomCategories[] | ApolloError> {
    try {
      return await this.ecomCategoriesService.searchEcomCategoriesChild(args)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw new ApolloError(err)
    }
  }

  @Query()
  async getEcomCategoriesTree() {
    try {
      return await this.ecomCategoriesService.getEcomCategoriesTree()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw new ApolloError(err)
    }
  }

  @Mutation()
  async createEcomCategories(
    @Args('input') input: EcomCategoriesInput,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.createEcomCategories(input, context)
  }

  @Mutation()
  async updateEcomCategories(
    @Args('id') id: string,
    @Args('input') input: EcomCategoriesInput,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.updateEcomCategories(
      id,
      input,
      context,
    )
  }

  @Mutation()
  async removeEcomCategories(
    @Args('ids') ids: string[],
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.removeEcomCategories(ids, context)
  }

  @Mutation()
  async updateCancelPublicCategories(
    @Args('id') id: string,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.ecomCategoriesService.updateCancelPublicCategories(id)
  }

  /** Resolver Fields */
  @ResolveField('CategoryParent')
  async fieldCustomer(
    @Parent()
    ecomCategory: EcomCategories,
    @Context() context: IContext,
  ) {
    if (hasOwnProperty(ecomCategory, 'CategoryParent'))
      return ecomCategory['CategoryParent']

    const result = await context.loaderManager
      .getLoader('EcomCategoryLoader')
      .load(ecomCategory.CategoryParent_Id)

    return result
  }
}
