import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { MapStockModelRelatedService } from './MapStockModelRelated.service'

@Resolver('MapStockModelRelated')
export class MapStockModelRelatedResolver {
  constructor(
    private readonly mapServiceProductService: MapStockModelRelatedService,
  ) {}

  @Query()
  async getMapStockModelRelateds() {
    return await this.mapServiceProductService.getMapStockModelRelateds()
  }

  @Query()
  async getMapStockModelRelatedsByStockModel(
    @Args('idStockModel') idStockModel: string,
    @Args('limit') limit: number,
  ) {
    return await this.mapServiceProductService.getMapStockModelRelatedsByStockModel(
      idStockModel,
      limit,
    )
  }

  @Mutation()
  async createMapStockModelRelated(
    @Args('idStockModel') idStockModel: string,
    @Args('idsStockModelRelated') idsStockModelRelated: string[],
  ) {
    return await this.mapServiceProductService.createMapStockModelRelated(
      idStockModel,
      idsStockModelRelated,
    )
  }
}
