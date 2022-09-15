import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MapStockModelRelatedModule } from 'src/modules/MapStockModelRelated/MapStockModelRelated.module'

import {
  EcomCategoriesEntity,
  EcomCategoriesSchema,
} from '../EcomCategories/schemas/EcomCategories.schema'
import { MapServiceProductModule } from '../MapServiceProduct/MapServiceProduct.module'
import {
  OrderDetailEntity,
  OrderDetailSchema,
} from '../OrderDetail/schemas/OrderDetail.schema'
import { ThuTuSinhMaModule } from '../ThuTuSinhMa/ThuTuSinhMa.module'
import { StockModelEntity, StockModelSchema } from './schemas/StockModel.schema'
import { StockModelResolver } from './StockModel.resolver'
import { StockModelService } from './StockModel.service'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockModelEntity.name, schema: StockModelSchema },
      { name: EcomCategoriesEntity.name, schema: EcomCategoriesSchema },
      { name: OrderDetailEntity.name, schema: OrderDetailSchema },
    ]),
    MapStockModelRelatedModule,
    MapServiceProductModule,
    ThuTuSinhMaModule,
  ],
  providers: [StockModelService, StockModelResolver],
  exports: [StockModelService],
})
export class StockModelModule {}
