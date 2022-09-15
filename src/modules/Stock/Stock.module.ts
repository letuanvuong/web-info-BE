import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { OrderEntity, OrderSchema } from '../Order/schemas/order.schema'
import {
  OrderDetailEntity,
  OrderDetailSchema,
} from '../OrderDetail/schemas/OrderDetail.schema'
import {
  StockModelEntity,
  StockModelSchema,
} from '../StockModel/schemas/StockModel.schema'
import { StockEntity, StockSchema } from './schemas/Stock.schema'
import { StockResolver } from './Stock.resolver'
import { StockService } from './Stock.service'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockEntity.name, schema: StockSchema },
      { name: StockModelEntity.name, schema: StockModelSchema },
      { name: OrderEntity.name, schema: OrderSchema },
      { name: OrderDetailEntity.name, schema: OrderDetailSchema },
    ]),
  ],
  providers: [StockService, StockResolver],
  exports: [StockService],
})
export class StockModule {}
