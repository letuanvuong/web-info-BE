import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { MapServiceProductService } from './MapServiceProduct.service'

@Resolver('MapServiceProduct')
export class MapServiceProductResolver {
  constructor(
    private readonly mapServiceProductService: MapServiceProductService,
  ) {}

  @Query()
  async getMapServiceProducts() {
    return await this.mapServiceProductService.getMapServiceProducts()
  }

  @Query()
  async getMapServiceProductsByService(
    @Args('idService') idService: string,
    @Args('limit') limit: number,
  ) {
    return await this.mapServiceProductService.getMapServiceProductsByService(
      idService,
      limit,
    )
  }

  @Mutation()
  async createMapServiceProduct(
    @Args('idService') idService: string,
    @Args('idsStockModel') idsStockModel: string[],
  ) {
    return await this.mapServiceProductService.createMapServiceProduct(
      idService,
      idsStockModel,
    )
  }

  @Mutation()
  async removeMapServiceProduct(
    @Args('idService') idService: string,
    @Args('idsStockModel') idsStockModel: string[],
  ) {
    return await this.mapServiceProductService.removeMapServiceProduct(
      idService,
      idsStockModel,
    )
  }
}
