import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  BlogInput,
  FilterBlogInput,
  SearchBlogInput,
  SortBlogInput,
} from 'src/schema'

import { BlogService } from './Blog.service'
import { BlogDocument } from './schemas/Blog.schema'

@Resolver('Blog')
export class BlogResolver {
  constructor(private readonly blogService: BlogService) {}

  @Query()
  async getBlogs() {
    return await this.blogService.getBlogs()
  }

  @Query()
  async getBlogById(@Args('_id') _id: string) {
    return await this.blogService.getBlogById(_id)
  }

  @Query()
  async getBlogBySlug(@Args('slug') slug: string) {
    return await this.blogService.getBlogBySlug(slug)
  }

  @Query()
  async getBlogPagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchBlogInput],
    @Args('filter') filter: [FilterBlogInput],
    @Args('sort') sort: [SortBlogInput],
    @Args('idsDefault') idsDefault?: [string],
  ) {
    return await this.blogService.getBlogPagination(
      page,
      limit,
      search,
      filter,
      sort,
      idsDefault,
    )
  }

  @Query()
  async getBlogPaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchBlogInput],
    @Args('filter') filter: [FilterBlogInput],
  ) {
    return await this.blogService.getBlogPaginationTotal(
      page,
      limit,
      search,
      filter,
    )
  }

  @Mutation()
  async createBlog(
    @Args('input') input: BlogInput,
    @Args('idsBlogRelated') idsBlogRelated: string[],
  ): Promise<BlogDocument> {
    return await this.blogService.createBlog(input, idsBlogRelated)
  }

  @Mutation()
  async updateBlog(
    @Args('_id') _id: string,
    @Args('input') input: BlogInput,
    @Args('idsBlogRelated') idsBlogRelated: string[],
  ): Promise<BlogDocument> {
    return await this.blogService.updateBlog(_id, input, idsBlogRelated)
  }

  @Mutation()
  async deleteBlog(@Args('_id') _id: string): Promise<BlogDocument> {
    return await this.blogService.deleteBlog(_id)
  }
  @Mutation()
  async changePriorityBlog(@Args('_id') _id: string): Promise<BlogDocument> {
    return await this.blogService.changePriorityBlog(_id)
  }
  @Mutation()
  async unChangePriorityMultiBlog(
    @Args('ids') ids: string[],
  ): Promise<BlogDocument[]> {
    return await this.blogService.unChangePriorityMultiBlog(ids)
  }
  @Mutation()
  async publicBlog(@Args('_id') _id: string): Promise<BlogDocument> {
    return await this.blogService.publicBlog(_id)
  }

  @Mutation()
  async updateFeatureBlog(@Args('_id') _id: string): Promise<BlogDocument> {
    return await this.blogService.updateFeatureBlog(_id)
  }
}
