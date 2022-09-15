import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  StockModelEntity,
  StockModelSchema,
} from 'src/modules/StockModel/schemas/StockModel.schema'

import { MapStockModelRelatedResolver } from './MapStockModelRelated.resolver'
import { MapStockModelRelatedService } from './MapStockModelRelated.service'
import {
  MapStockModelRelatedEntity,
  MapStockModelRelatedSchema,
} from './schemas/MapStockModelRelated.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MapStockModelRelatedEntity.name,
        schema: MapStockModelRelatedSchema,
      },
      { name: StockModelEntity.name, schema: StockModelSchema },
    ]),
  ],
  providers: [MapStockModelRelatedService, MapStockModelRelatedResolver],
  exports: [MapStockModelRelatedService],
})
export class MapStockModelRelatedModule {}
