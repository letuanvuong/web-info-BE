import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  EcomCategoriesFilter,
  EcomCategoriesSearch,
  EcomCategoriesSort,
} from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { StaffService } from './Staff.service'

@Resolver('Staff')
export class StaffResolver {
  constructor(private readonly staffService: StaffService) {}

  @Query()
  async staffs(@Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const staffs = await this.staffService.getStaffs()
    return staffs
  }

  @Query()
  async staff(@Args('id') id: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    const staff = await this.staffService.getStaff({ _id: id })
    return staff
  }

  @Query()
  async getMultipleStaff(@Args() args, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.staffService.getMultipleStaff(args)
  }

  @Mutation()
  async createStaff(@Args() args: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.staffService.createStaff(args, context)
  }

  @Mutation()
  async updateStaff(@Args() args: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.staffService.updateStaff(args, context)
  }

  @Mutation()
  async removeStaff(@Args() args: any, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.staffService.removeStaff(args, context)
  }

  @Query()
  async searchStaff(@Args() args, @Context() context: IContext) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.staffService.searchStaff(args)
  }

  @Query()
  async getStaffPagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('searchInput') searchInput: [EcomCategoriesSearch],
    @Args('filterInput') filterInput: [EcomCategoriesFilter],
    @Args('sortInput') sortInput: [EcomCategoriesSort],
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.staffService.getStaffPagination(
      page,
      limit,
      searchInput,
      filterInput,
      sortInput,
    )
  }

  @Query()
  async getStaffPaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('searchInput') searchInput: [EcomCategoriesSearch],
    @Args('filterInput') filterInput: [EcomCategoriesFilter],
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.staffService.getStaffPaginationTotal(
      page,
      limit,
      searchInput,
      filterInput,
    )
  }
}
