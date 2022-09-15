import { Args, Query, Resolver } from '@nestjs/graphql'
import { EnumTypeSearch } from 'src/schema'

import { UniversalSearchService } from './UniversalSearch.service'

@Resolver('UniversalSearch')
export class UniversalSearchResolver {
  constructor(
    private readonly mapServiceProductService: UniversalSearchService,
  ) {}

  @Query()
  async searchByType(
    @Args('key') key: string,
    @Args('type') type: EnumTypeSearch,
  ) {
    return await this.mapServiceProductService.searchByType(key, type)
  }
}
