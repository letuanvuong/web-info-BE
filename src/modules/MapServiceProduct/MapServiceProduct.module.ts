import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  ServiceEntity,
  ServiceSchema,
} from 'src/modules/Service/schemas/Service.schema'
import {
  StockModelEntity,
  StockModelSchema,
} from 'src/modules/StockModel/schemas/StockModel.schema'

import { MapServiceProductResolver } from './MapServiceProduct.resolver'
import { MapServiceProductService } from './MapServiceProduct.service'
import {
  MapServiceProductEntity,
  MapServiceProductSchema,
} from './schemas/MapServiceProduct.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MapServiceProductEntity.name, schema: MapServiceProductSchema },
      { name: StockModelEntity.name, schema: StockModelSchema },
      { name: ServiceEntity.name, schema: ServiceSchema },
    ]),
  ],
  providers: [MapServiceProductService, MapServiceProductResolver],
  exports: [MapServiceProductService],
})
export class MapServiceProductModule {}
