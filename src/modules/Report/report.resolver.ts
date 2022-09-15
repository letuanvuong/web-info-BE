import { Args, Context, Query, Resolver } from '@nestjs/graphql'
import { FilterReportInput } from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { ReportService } from './report.service'

@Resolver('Report')
export class ReportResolver {
  constructor(private reportService: ReportService) {}

  @Query()
  async reportTotalOrder(
    @Args('filter') filter: FilterReportInput,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.reportService.reportTotalOrder(filter)
  }

  @Query()
  async reportRevenue(
    @Args('filter') filter: FilterReportInput,
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.reportService.reportRevenue(filter)
  }
}
