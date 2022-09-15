import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  FilterServiceInput,
  SearchServiceInput,
  ServiceInput,
  SortServiceInput,
} from 'src/schema'

import { ServiceDocument } from './schemas/Service.schema'
import { ServiceService } from './Service.service'

@Resolver('Service')
export class ServiceResolver {
  constructor(private readonly serviceService: ServiceService) {}

  @Query()
  async getServices() {
    return await this.serviceService.getServices()
  }

  @Query()
  async getServiceById(@Args('_id') _id: string) {
    return await this.serviceService.getServiceById(_id)
  }

  @Query()
  async getServiceBySlug(@Args('slug') slug: string) {
    return await this.serviceService.getServiceBySlug(slug)
  }

  @Query()
  async getServicePagination(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchServiceInput],
    @Args('filter') filter: [FilterServiceInput],
    @Args('sort') sort: [SortServiceInput],
  ) {
    return await this.serviceService.getServicePagination(
      page,
      limit,
      search,
      filter,
      sort,
    )
  }

  @Query()
  async getServicePaginationTotal(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('search') search: [SearchServiceInput],
    @Args('filter') filter: [FilterServiceInput],
  ) {
    return await this.serviceService.getServicePaginationTotal(
      page,
      limit,
      search,
      filter,
    )
  }

  @Mutation()
  async createService(
    @Args('input') input: ServiceInput,
  ): Promise<ServiceDocument> {
    return await this.serviceService.createService(input)
  }

  @Mutation()
  async updateService(
    @Args('_id') _id: string,
    @Args('input') input: ServiceInput,
  ): Promise<ServiceDocument> {
    return await this.serviceService.updateService(_id, input)
  }

  @Mutation()
  async deleteService(@Args('_id') _id: string): Promise<ServiceDocument> {
    return await this.serviceService.deleteService(_id)
  }
}
