import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  EmailInput,
  FilterEmailInput,
  SearchEmailInput,
  SortEmailInput,
} from 'src/schema'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SubscriberService } from './Subscriber.service'

@Resolver('Subscriber')
export class SubscriberResolver {
  constructor(private readonly SubscriberService: SubscriberService) {}

  @Mutation()
  async subscribeEmail(@Args('input') input: EmailInput) {
    return await this.SubscriberService.subscribeEmail(input)
  }

  @Mutation()
  async unSubscribeEmail(@Args('_id') _id: string) {
    return await this.SubscriberService.unSubscribeEmail(_id)
  }

  @Query()
  async getAllEmailOnSubs() {
    return await this.SubscriberService.getAllEmailOnSubs()
  }

  @Query()
  async getEmailOnSubsPagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchEmailInput],
    @Args('filter') filter: [FilterEmailInput],
    @Args('sort') sort: [SortEmailInput],
  ) {
    return await this.SubscriberService.getEmailOnSubsPagination(
      page,
      limit,
      search,
      filter,
      sort,
    )
  }

  @Query()
  async getEmailOnSubsPaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchEmailInput],
    @Args('filter') filter: [FilterEmailInput],
  ) {
    return await this.SubscriberService.getEmailOnSubsPaginationTotal(
      page,
      limit,
      search,
      filter,
    )
  }
}
