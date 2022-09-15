import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-express'
import {
  FilterMailContactInput,
  InputMailContact,
  SearchMailContactInput,
  SortMailContactInput,
} from 'src/schema'

import { UnauthenticatedError } from '../auth/auth.error'
import { IContext } from '../base-modules/graphql/gql.type'
import { MailContactService } from './MailContact.service'
import { MailContactDocument } from './schemas/MailContact.schema'

@Resolver('MailContact')
export class MailContactResolver {
  constructor(private readonly mailContactService: MailContactService) {}

  @Query()
  async getMailContacts() {
    return await this.mailContactService.getMailContacts()
  }

  @Query()
  async getMailContactPagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchMailContactInput],
    @Args('filter') filter: [FilterMailContactInput],
    @Args('sort') sort: [SortMailContactInput],
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.mailContactService.getMailContactPagination(
      page,
      limit,
      search,
      filter,
      sort,
    )
  }

  @Query()
  async getMailContactPaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchMailContactInput],
    @Args('filter') filter: [FilterMailContactInput],
    @Context() context: IContext,
  ) {
    const currentUserId = await context?.authManager.getCurrentUserId()
    if (!currentUserId) throw new UnauthenticatedError('Please login')
    return await this.mailContactService.getMailContactPaginationTotal(
      page,
      limit,
      search,
      filter,
    )
  }

  @Mutation()
  async createMailContact(
    @Args('input') input: InputMailContact,
  ): Promise<MailContactDocument | ApolloError> {
    return await this.mailContactService.createMailContact(input)
  }

  @Mutation()
  async deleteMailContact(
    @Args('_id') _id: string,
  ): Promise<MailContactDocument | ApolloError> {
    return await this.mailContactService.deleteMailContact(_id)
  }
}
