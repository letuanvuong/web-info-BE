import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  FilterPageInput,
  PageInput,
  SearchPageInput,
  SortPageInput,
} from 'src/schema'

import { PageService } from './Page.service'
import { PageDocument } from './schemas/Page.schema'

@Resolver('Page')
export class PageResolver {
  constructor(private readonly pageService: PageService) {}

  @Query()
  async getPages() {
    return await this.pageService.getPages()
  }

  @Query()
  async getPageById(@Args('_id') _id: string) {
    return await this.pageService.getPageById(_id)
  }

  @Query()
  async getPageBySlug(@Args('slug') slug: string) {
    return await this.pageService.getPageBySlug(slug)
  }

  @Query()
  async getPagePagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchPageInput],
    @Args('filter') filter: [FilterPageInput],
    @Args('sort') sort: [SortPageInput],
  ) {
    return await this.pageService.getPagePagination(
      page,
      limit,
      search,
      filter,
      sort,
    )
  }

  @Query()
  async getPagePaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchPageInput],
    @Args('filter') filter: [FilterPageInput],
  ) {
    return await this.pageService.getPagePaginationTotal(
      page,
      limit,
      search,
      filter,
    )
  }

  @Mutation()
  async createPage(@Args('input') input: PageInput): Promise<PageDocument> {
    return await this.pageService.createPage(input)
  }

  @Mutation()
  async updatePage(
    @Args('_id') _id: string,
    @Args('input') input: PageInput,
  ): Promise<PageDocument> {
    return await this.pageService.updatePage(_id, input)
  }

  @Mutation()
  async deletePage(@Args('_id') _id: string): Promise<PageDocument> {
    return await this.pageService.deletePage(_id)
  }
}
