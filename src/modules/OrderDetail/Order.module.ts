import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { OrderDetailResolver } from './OrderDetail.resolver'
import { OrderDetailService } from './OrderDetail.service'
import {
  OrderDetailEntity,
  OrderDetailSchema,
} from './schemas/OrderDetail.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderDetailEntity.name, schema: OrderDetailSchema },
    ]),
  ],
  providers: [OrderDetailService, OrderDetailResolver],
  exports: [OrderDetailService],
})
export class OrderDetailModule {}
