import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { OrderEntity, OrderSchema } from '../Order/schemas/order.schema'
import {
  OrderDetailEntity,
  OrderDetailSchema,
} from '../OrderDetail/schemas/OrderDetail.schema'
import { ReportResolver } from './report.resolver'
import { ReportService } from './report.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderEntity.name, schema: OrderSchema },
      { name: OrderDetailEntity.name, schema: OrderDetailSchema },
    ]),
  ],
  providers: [ReportService, ReportResolver],
  exports: [ReportService],
})
export class ReportModule {}
