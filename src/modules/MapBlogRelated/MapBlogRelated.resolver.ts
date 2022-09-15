import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { MapBlogRelatedService } from './MapBlogRelated.service'

@Resolver('MapBlogRelated')
export class MapBlogRelatedResolver {
  constructor(private readonly mapBlogRelatedService: MapBlogRelatedService) {}

  @Query()
  async getMapBlogRelateds() {
    return await this.mapBlogRelatedService.getMapBlogRelateds()
  }

  @Query()
  async getMapBlogRelatedsByBlog(
    @Args('idBlog') idBlog: string,
    @Args('limit') limit: number,
  ) {
    return await this.mapBlogRelatedService.getMapBlogRelatedsByBlog(
      idBlog,
      limit,
    )
  }

  @Mutation()
  async createMapBlogRelated(
    @Args('idBlog') idBlog: string,
    @Args('idsBlogRelated') idsBlogRelated: string[],
  ) {
    return await this.mapBlogRelatedService.createMapBlogRelated(
      idBlog,
      idsBlogRelated,
    )
  }
}
