import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BlogEntity, BlogSchema } from 'src/modules/Blog/schemas/Blog.schema'
import {
  ServiceEntity,
  ServiceSchema,
} from 'src/modules/Service/schemas/Service.schema'
import {
  StockModelEntity,
  StockModelSchema,
} from 'src/modules/StockModel/schemas/StockModel.schema'

import { UniversalSearchResolver } from './UniversalSearch.resolver'
import { UniversalSearchService } from './UniversalSearch.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockModelEntity.name, schema: StockModelSchema },
      { name: ServiceEntity.name, schema: ServiceSchema },
      { name: BlogEntity.name, schema: BlogSchema },
    ]),
  ],
  providers: [UniversalSearchService, UniversalSearchResolver],
  exports: [UniversalSearchService],
})
export class UniversalSearchModule {}
